import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';

import {registerHandler} from '../../src/handlers';
import {initEmptyModels, UserRepository} from '../../src/db';
import {UserInstance} from '../../src/db/tables/user';

describe('registerHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let bcryptHashMock = jest.spyOn(bcrypt, 'hash');
    let findUserMock = jest.spyOn(UserRepository, 'findOne');
    let createUserMock = jest.spyOn(UserRepository, 'create');

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect credentials', () => {
        it('should return 400 if credentials are empty', async () => {
            req = {
                body: {},
            } as Request;

            await registerHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect credentials',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if username is empty', async () => {
            req = {
                body: {
                    password: 'pass',
                },
            } as Request;

            await registerHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect credentials',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if password is empty', async () => {
            req = {
                body: {
                    username: 'user',
                },
            } as Request;

            await registerHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect credentials',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('correct credentials', () => {
        beforeEach(() => {
            req = {
                body: {
                    username: 'user',
                    password: 'pass',
                },
            } as Request;
        });

        it('should search user in DB', async () => {
            await registerHandler(req, res);

            expect(findUserMock).toHaveBeenCalledWith({
                where: {
                    username: 'user',
                },
            });
        });

        it('should return 400 if username is already taken', async () => {
            findUserMock.mockResolvedValue({} as UserInstance);

            await registerHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Username already exists',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should hash password if username is available', async () => {
            findUserMock.mockResolvedValue(null);
            bcryptHashMock.mockImplementation(async () => 'hashedPass');

            await registerHandler(req, res);

            expect(bcryptHashMock).toHaveBeenCalledWith('pass', 10);
        });

        it('should create user in DB with hashed password if username is available', async () => {
            findUserMock.mockResolvedValue(null);
            createUserMock.mockResolvedValue({});
            bcryptHashMock.mockImplementation(async () => 'hashedPass');

            await registerHandler(req, res);

            expect(createUserMock).toHaveBeenCalledWith({
                username: 'user',
                password: 'hashedPass',
            });
        });

        it('should return 201 with success message', async () => {
            findUserMock.mockResolvedValue(null);
            createUserMock.mockResolvedValue({});
            bcryptHashMock.mockImplementation(async () => 'hashedPass');

            await registerHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                message: 'User registered successfully',
            });
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });
});
