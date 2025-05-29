import {Request, Response} from 'express';

import {Post} from '../entities/post';
import {CommonError} from '../entities/commonError';
import {
    AttributeRepository,
    PostAttributeRepository,
    PostRepository,
} from '../db';
import {AttributeSchema} from '../db/tables/attribute';
import {PostAttributeSchema} from '../db/tables/postAttribute';

export type PostPrediction = {
    prediction: string;
    color: string;
};

export type PostWithPrediction = {
    id: string;
    predictions: PostPrediction[];
};

export type AddPostsAttributesRequest = {
    texts: PostWithPrediction[];
};

export type AddPostsAttributesResponse = {
    posts: Post[];
};

/**
 * Создает связь между существующими в БД постами и новыми (создаваемыми впервые) или существующими атрибутами.
 *
 * При некорректных данных возвращает 400.
 * При корректных данных, но при ошибке в процессе создания атрибутов или связи между атрибутами и постами, возвращает 500.
 * При корректных данных:
 * Ищет в БД переданные атрибуты по полям name и color (соотв. в теле запроса это prediction и color).
 * Если совпадений не нашлось, создает записи в таблице Attribute. Если нашлись - использует id этих записей.
 * Затем создает записи в таблице PostAttribute и возвращает посты со связанными атрибутами и статус 202.
 * @param {Request} req
 * @param {Response<undefined | CommonError>} res
 */
export const addPostsAttributesHandler = async (
    req: Request<AddPostsAttributesRequest>,
    res: Response<AddPostsAttributesResponse | CommonError>
) => {
    try {
        const body = req.body;

        if (!body?.texts?.length) {
            res.status(400).send({
                error: 'Incorrect params',
            });

            return;
        }

        const posts: Post[] = [];

        for (let text of body.texts) {
            const {id: postId, predictions} = text as PostWithPrediction;
            const preparedPostId = String(postId).trim();
            const attributesIds: string[] = [];

            for (let prediction of predictions) {
                let attributeId;

                const preparedName = String(prediction.prediction).trim();
                const preparedColor = String(prediction.color).trim();

                const existingAttribute = await AttributeRepository.findOne({
                    where: {
                        name: preparedName,
                    },
                });

                if (existingAttribute) {
                    attributeId = existingAttribute.id;
                } else {
                    const createdAttribute =
                        // @ts-ignore
                        await AttributeRepository.create({
                            name: preparedName,
                            color: preparedColor,
                        } as AttributeSchema);

                    if (!createdAttribute) {
                        res.status(400).send({
                            error:
                                'Error while creating attribute ' +
                                prediction.prediction,
                        });

                        return;
                    } else {
                        attributeId = createdAttribute.id;
                    }
                }

                if (!attributeId) {
                    res.status(400).send({
                        error: 'Incorrect params for postId ' + postId,
                    });

                    return;
                }

                attributesIds.push(attributeId);
            }

            if (attributesIds?.length) {
                await PostAttributeRepository.bulkCreate(
                    // @ts-ignore
                    attributesIds.map(
                        attributeId =>
                            ({
                                attributeId,
                                postId: preparedPostId,
                            }) as PostAttributeSchema
                    )
                );
            }

            const post = await PostRepository.findOne({
                where: {
                    id: preparedPostId,
                },
            });

            if (post) {
                posts.push(post as Post);
            }
        }

        res.status(202).send({posts});
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while updating posts',
        });
    }
};
