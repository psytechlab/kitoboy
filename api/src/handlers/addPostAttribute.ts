import {Request, Response} from 'express';

import {CommonError} from '../entities/commonError';
import {PostAttributeRepository} from '../db';
import {PostAttributeSchema} from '../db/tables/postAttribute';

/**
 * Создает связь между существующими в БД атрибутом и постом
 *
 * При отсутствии в БД переданного postId или attributeId или при некорректных данных возвращает 400.
 * При корректных данных, но при ошибке в процессе создания связи между атрибутом и постом, возвращает 500.
 * При корректных данных и отсутствии ошибок создает запись в таблице PostAttribute и возвращает 202.
 * @param {Request} req
 * @param {Response<undefined | CommonError>} res
 */
export const addPostAttributeHandler = async (
    req: Request,
    res: Response<undefined | CommonError>
) => {
    try {
        const postId = req.params.postId || '';
        const body = req.body;
        const attributeId = body?.attributeId;

        if (!postId || !body || !attributeId) {
            res.status(400).send({
                error: 'Incorrect params',
            });

            return;
        }

        const preparedPostId = postId.trim();
        const preparedAttributeId = attributeId.trim();

        // @ts-ignore
        const createdEntity = await PostAttributeRepository.create({
            postId: preparedPostId,
            attributeId: preparedAttributeId!,
        } as PostAttributeSchema);

        if (!createdEntity) {
            res.status(500).send({
                error: 'Error while creating post-attribute connection',
            });

            return;
        }

        res.status(202).send();
    } catch (err: any) {
        console.error('Error while creating post-attribute connection', err);

        res.status(500).json({
            error: 'Error while creating post-attribute connection',
        });
    }
};
