import {Request, Response} from 'express';

/**
 * Возвращает статус 404 и текст ошибки 'Not found'.
 *
 * @param {Request} req
 * @param {Response} res
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).send({
        error: 'Not found',
    });
};
