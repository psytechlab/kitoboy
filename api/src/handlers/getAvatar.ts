import {Request, Response} from 'express';

import {AvatarView} from '../entities/avatarView';
import {CommonError} from '../entities/commonError';
import {
    AttributeRepository,
    AvatarRepository,
    PersonRepository,
    PostRepository,
    StatusRepository,
} from '../db';

export type GetAvatarResponse = AvatarView;

/**
 * Возвращает аватар с переданным Id из БД, обогащая данными из связанных таблиц.
 *
 * При некорректных данных возвращает 400.
 * При отсутствии в БД аватара с переданным Id возвращает 404.
 * При наличии в БД аватара с переданным Id, дополняет его модель данными о персоне, связанной с аватаром,
 * а также о статусе аватара, его постах и атрибутах его постов.
 * @param {Request} req
 * @param {Response<GetAvatarResponse | CommonError>} res
 */
export const getAvatarHandler = async (
    req: Request,
    res: Response<GetAvatarResponse | CommonError>
) => {
    try {
        const avatarId = req.params.avatarId || '';

        if (!avatarId) {
            res.status(400).send({
                error: 'Incorrect avatarId',
            });

            return;
        }

        const avatar = await AvatarRepository.findOne({
            where: {
                id: String(avatarId),
            },
            include: [
                {
                    model: PostRepository,
                    include: [
                        {
                            model: AttributeRepository,
                            as: 'attributes',
                        },
                    ],
                },
                {
                    model: StatusRepository,
                    as: 'status',
                },
                {
                    model: PersonRepository,
                    as: 'person',
                },
            ],
        });

        if (!avatar) {
            res.status(404).send();

            return;
        }

        const {id, username, url, status, person, posts} = avatar;

        const personView = person
            ? {
                  id: person.id!,
                  surname: person.surname || '',
                  name: person.name || '',
                  secondName: person.secondName || '',
                  age: person.age || '',
              }
            : {};

        const statusView = status
            ? {
                  id: status.id!,
                  name: status.name || '',
                  color: status.color || '',
              }
            : {};

        const postViews = posts?.map(({id, text, postedAt, attributes}) => {
            const attributeViews = attributes?.map(({id, name, color}) => {
                return {
                    id: id,
                    name: name || '',
                    color: color || '',
                };
            });

            return {
                id,
                text: text || '',
                postedAt: postedAt || '',
                attributes: attributeViews || [],
            };
        });

        // @ts-ignore
        res.status(200).send({
            id: id || avatarId,
            username: username || '',
            url: url || '',
            person: personView,
            status: statusView,
            posts: postViews || [],
        } as AvatarView);
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while selecting avatar',
        });
    }
};
