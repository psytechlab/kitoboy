import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';

import {CommonError} from '../entities/commonError';
import {UserRepository} from '../db';
import {UserSchema} from '../db/tables/user';

/**
 * Регистрация пользователя по логину и паролю
 *
 * При наличии пользователя с переданным логином в БД или некорректных данных возвращает 400
 * При отсутствии пользователя в БД создает его с захэшированным паролем и возвращает 201
 * @param {Request} req
 * @param {Response<{message: string} | CommonError>} res
 */
export const registerHandler = async (
    req: Request,
    res: Response<{message: string} | CommonError>
) => {
    try {
        const {username, password} = req.body;
        const trimmedUsername = username?.trim();
        const trimmedPassword = password?.trim();

        if (!trimmedUsername || !trimmedPassword) {
            res.status(400).json({
                error: 'Incorrect credentials',
            });

            return;
        }

        const existingUser = await UserRepository.findOne({
            where: {
                username: trimmedUsername,
            },
        });

        if (existingUser) {
            res.status(400).json({
                error: 'Username already exists',
            });

            return;
        }

        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

        // @ts-ignore
        const createdUser = await UserRepository.create({
            username: trimmedUsername,
            password: hashedPassword,
        } as UserSchema);

        if (!createdUser) {
            throw new Error();
        }

        res.status(201).send({message: 'User registered successfully'});
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while registering user',
        });
    }
};
