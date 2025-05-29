import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware проверяет наличие авторизационного токена в заголовке 'authorization' запроса.
 *
 * При наличии токена верифицирует его с помощью jsonwebtoken.
 * При успешной верификации передает исполнение дальше, при неуспешной - возвращает HTTP 401.
 * @name authenticateToken
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers?.['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        res.sendStatus(401);

        return;
    }

    jwt.verify(token, process.env.AUTH_KEY || '', (err: any) => {
        if (err) {
            res.sendStatus(401);

            return;
        }

        next();
    });
};
