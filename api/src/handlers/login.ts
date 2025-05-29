import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {CommonError} from '../entities/commonError';
import {UserRepository} from '../db';

/**
 * Авторизация пользователя по логину и паролю.
 *
 * При наличии пользователя в БД, сверяет пароль в захэшированном виде
 * и предоставляет в ответе Auth-токен со сроком действия 12 часов
 * При отсутствии пользователя в БД, несоответствии пароля или некорректных данных возвращает 401
 * @param {Request} req
 * @param {Response<{message: string; token: string} | CommonError>} res
 */
export const loginHandler = async (
    req: Request,
    res: Response<{message: string; token: string} | CommonError>
) => {
    try {
        const {username, password} = req.body;
        const trimmedUsername = username?.trim();
        const trimmedPassword = password?.trim();

        if (!trimmedUsername || !trimmedPassword) {
            res.status(401).json({
                error: 'Incorrect credentials',
            });

            return;
        }

        const existingUser = await UserRepository.findOne({
            where: {
                username: trimmedUsername,
            },
        });

        if (!existingUser) {
            res.status(401).json({
                error: 'Incorrect credentials',
            });

            return;
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            existingUser!.password
        );

        if (!isPasswordCorrect) {
            res.status(401).json({
                error: 'Incorrect credentials',
            });

            return;
        } else {
            const secretKey = process.env.AUTH_KEY || 'secret-key';
            const token = jwt.sign(
                {username: existingUser?.username},
                secretKey,
                {expiresIn: '12h'}
            );

            res.status(200).json({message: 'Login successful', token});
        }
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while registering user',
        });
    }
};
