import {Request, Response} from 'express';

import {CommonError} from '../entities/commonError';
import {PostAttributeRepository} from '../db';

/**
 * Удаляет из БД связь между постом и атрибутом (запись из таблицы PostAttribute).
 *
 * Возвращает 400, если не переданы id поста или атрибута.
 * Возвращает 404, если связь между постом и атрибутом с переданными id не найдена.
 * Удаляет запись и возвращает 200, если связь между постом и атрибутом с переданными id найдена.
 * @param {Request} req
 * @param {Response<undefined | CommonError>} res
 */
export const removePostAttributeHandler = async (
    req: Request,
    res: Response<undefined | CommonError>
) => {
    try {
        const postId = req.params?.postId;
        const attributeId = req.body?.attributeId;

        if (!postId || !attributeId) {
            res.status(400).send({
                error: 'Incorrect params',
            });

            return;
        }

        const preparedPostId = postId.trim();
        const preparedAttributeId = attributeId.trim();

        const entity = await PostAttributeRepository.findOne({
            where: {
                postId: preparedPostId,
                attributeId: preparedAttributeId!,
            },
        });

        if (!entity) {
            res.status(404).send({
                error: `Attribute ${attributeId} not found at post ${postId}`,
            });

            return;
        }

        await entity?.destroy();

        res.status(200).send();
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while deleting post-attribute connection',
        });
    }
};
