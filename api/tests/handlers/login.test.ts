import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {loginHandler} from '../../src/handlers';
import {initEmptyModels, UserRepository} from '../../src/db';
import {UserInstance} from '../../src/db/tables/user';

describe('loginHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
    } as unknown as Response;
    let jwtSignMock = jest.spyOn(jwt, 'sign');
    let bcryptCompareMock = jest.spyOn(bcrypt, 'compare');
    let findUserMock = jest.spyOn(UserRepository, 'findOne');

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect credentials', () => {
        it('should return 401 if credentials are empty', async () => {
            req = {
                body: {},
            } as Request;

            await loginHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect credentials',
            });
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 401 if username is empty', async () => {
            req = {
                body: {
                    password: 'pass',
                },
            } as Request;

            await loginHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect credentials',
            });
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 401 if password is empty', async () => {
            req = {
                body: {
                    username: 'user',
                },
            } as Request;

            await loginHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect credentials',
            });
            expect(res.status).toHaveBeenCalledWith(401);
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
            await loginHandler(req, res);

            expect(findUserMock).toHaveBeenCalledWith({
                where: {
                    username: 'user',
                },
            });
        });

        it('should return 401 if user does not exist', async () => {
            findUserMock.mockResolvedValue(null);

            await loginHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect credentials',
            });
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should compare password if user exists', async () => {
            findUserMock.mockResolvedValue({
                password: 'passwd',
                username: 'user',
            } as UserInstance);
            bcryptCompareMock.mockImplementation(async () => true);

            await loginHandler(req, res);

            expect(bcryptCompareMock).toHaveBeenCalledWith('pass', 'passwd');
        });

        it('should return 401 if passwords do not match', async () => {
            findUserMock.mockResolvedValue({
                password: 'passwd',
                username: 'user',
            } as UserInstance);
            bcryptCompareMock.mockImplementation(async () => false);

            await loginHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect credentials',
            });
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should create token if passwords match', async () => {
            findUserMock.mockResolvedValue({
                password: 'pass',
                username: 'user',
            } as UserInstance);
            bcryptCompareMock.mockImplementation(async () => true);
            jwtSignMock.mockImplementation(() => 'token');

            await loginHandler(req, res);

            expect(jwtSignMock).toHaveBeenCalledWith(
                {username: 'user'},
                'secret-key',
                {expiresIn: '12h'}
            );
        });

        it('should return 200 and token if passwords match', async () => {
            findUserMock.mockResolvedValue({
                password: 'pass',
                username: 'user',
            } as UserInstance);
            bcryptCompareMock.mockImplementation(async () => true);
            jwtSignMock.mockImplementation(() => 'token');

            await loginHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Login successful',
                token: 'token',
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
