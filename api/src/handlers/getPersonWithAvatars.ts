import {Request, Response} from 'express';

import {
    AttributeRepository,
    AvatarRepository,
    PersonRepository,
    PostRepository,
    StatusRepository,
} from '../db';
import {CommonError} from '../entities/commonError';
import {AvatarView} from '../entities/avatarView';
import {PersonWithAvatarsView} from '../entities/personWithAvatarsView';

export type GetPersonWithAvatarsResponse = PersonWithAvatarsView;

/**
 * Возвращает персону с переданным id и связанные с ней аватары из БД.
 *
 * Упорядочивает аватары персоны по дате создания по убыванию.
 * Дополняет модель персоны данными о статусе, аватарах, их статусах и постах с атрибутами.
 * Возвращает 404, если персона с заданным id не найдена.
 * @param {Request} req
 * @param {Response<GetPersonWithAvatarsResponse | CommonError>} res
 */
export const getPersonWithAvatarsHandler = async (
    req: Request,
    res: Response<GetPersonWithAvatarsResponse | CommonError>
) => {
    try {
        const personId = req.params.personId;

        if (!personId) {
            res.status(400).send({
                error: 'Incorrect personId',
            });

            return;
        }

        const person = await PersonRepository.findOne({
            where: {
                id: String(personId),
            },
            include: [
                {
                    model: AvatarRepository,
                    order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: StatusRepository,
                            as: 'status',
                        },
                        {
                            model: PostRepository,
                            order: [['createdAt', 'DESC']],
                            as: 'posts',
                            include: [
                                {
                                    model: AttributeRepository,
                                    as: 'attributes',
                                },
                            ],
                        },
                    ],
                    as: 'avatars',
                },
                {
                    model: StatusRepository,
                    as: 'status',
                },
            ],
        });

        if (!person) {
            res.status(404).send({
                error: 'Person not found',
            });

            return;
        }

        const {
            id,
            surname,
            name,
            secondName,
            age,
            address,
            phone,
            organization,
            description,
            status: personStatus,
            avatars,
        } = person;

        const personStatusView = personStatus
            ? {
                  id: personStatus.id,
                  name: personStatus.name || '',
                  color: personStatus.color || '',
              }
            : undefined;

        const avatarViews: Omit<AvatarView, 'person'>[] | undefined =
            avatars?.map(({id, username, url, status: avatarStatus, posts}) => {
                const avatarStatusView = avatarStatus
                    ? {
                          id: avatarStatus.id,
                          name: avatarStatus.name || '',
                          color: avatarStatus.color || '',
                      }
                    : {};

                const postViews = posts?.map(
                    ({id, text, postedAt, attributes}) => {
                        const attributeViews = attributes?.map(
                            ({id, name, color}) => {
                                return {
                                    id: id,
                                    name: name || '',
                                    color: color || '',
                                };
                            }
                        );

                        return {
                            id,
                            text: text || '',
                            postedAt: postedAt || '',
                            attributes: attributeViews || [],
                        };
                    }
                );

                return {
                    id,
                    username: username || '',
                    url: url || '',
                    status: avatarStatusView,
                    posts: postViews || [],
                } as Omit<AvatarView, 'person'>;
            });

        // @ts-ignore
        res.status(200).send({
            id: id || personId,
            surname: surname || '',
            name: name || '',
            secondName: secondName || '',
            age: age || '',
            address: address || '',
            phone: phone || '',
            organization: organization || '',
            description: description || '',
            status: personStatusView,
            avatars: avatarViews || [],
        });
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while selecting person',
        });
    }
};
