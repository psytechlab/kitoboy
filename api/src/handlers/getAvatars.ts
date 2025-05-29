import {Request, Response} from 'express';
import {IncludeOptions} from 'sequelize/types/model';

import {
    AttributeRepository,
    AvatarRepository,
    PersonRepository,
    PostRepository,
    StatusRepository,
} from '../db';
import {CommonError} from '../entities/commonError';
import {AvatarView} from '../entities/avatarView';

export type GetAvatarsResponse = {
    avatars: AvatarView[];
    page: number;
    pages: number;
};

const AVATARS_PER_PAGE = 30;

/**
 * Возвращает аватары из БД, постранично, фильтруя по personId при его наличии в параметрах запроса.
 *
 * Для пагинации использует поля page и size из тела запроса.
 * Упорядочивает аватары по дате создания по убыванию.
 * Дополняет модель аватаров данными о персонах, связанных с аватарами,
 * а также о статусе аватаров, их постах и атрибутах их постов.
 * @param {Request} req
 * @param {Response<GetAvatarsResponse | CommonError>} res
 */
export const getAvatarsHandler = async (
    req: Request,
    res: Response<GetAvatarsResponse | CommonError>
) => {
    try {
        const personId = req.params.personId;

        const personFindOptions: IncludeOptions = {
            model: PersonRepository,
            as: 'person',
        };

        if (personId) {
            personFindOptions.where = {
                id: String(personId),
            };
        }

        const page = req.body.page || 1;
        const size = req.body.size || AVATARS_PER_PAGE;
        const offset = (page - 1) * size;

        const {rows: avatars, count} = await AvatarRepository.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: size,
            offset,
            distinct: true,
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
                personFindOptions,
            ],
        });

        const pagesOverall = count && size ? Math.ceil(count / size) : 0;

        const avatarViews: AvatarView[] = avatars.map(
            ({id, username, url, status, person, posts}) => {
                const personView = person
                    ? {
                          id: person.id,
                          surname: person.surname || '',
                          name: person.name || '',
                          secondName: person.secondName || '',
                          age: person.age || '',
                      }
                    : {};

                const statusView = status
                    ? {
                          id: status.id,
                          name: status.name || '',
                          color: status.color || '',
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

                // @ts-ignore
                return {
                    id,
                    username: username || '',
                    url: url || '',
                    person: personView,
                    status: statusView,
                    posts: postViews || [],
                } as AvatarView;
            }
        );

        res.status(200).send({
            avatars: avatarViews || [],
            page,
            pages: pagesOverall,
        });
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while selecting avatars',
        });
    }
};
