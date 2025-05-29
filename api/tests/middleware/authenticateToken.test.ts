import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import {authenticateToken} from '../../src/middleware';

describe('authenticateToken', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;
    let jwtVerifyMock = jest.spyOn(jwt, 'verify');

    describe('token does not exist', () => {
        beforeEach(() => {
            req = {} as Request;
            res = {
                sendStatus: jest.fn(),
            } as unknown as Response;
            next = jest.fn();
        });

        it('should return 401 and should not call next function', () => {
            authenticateToken(req, res, next);

            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('token exists', () => {
        beforeEach(() => {
            // @ts-ignore
            jwtVerifyMock.mockImplementation((a, b, cb) => cb!(null));

            req = {
                headers: {
                    authorization: 'Bearer testToken',
                },
            } as Request;
            res = {
                sendStatus: jest.fn(),
            } as unknown as Response;
            next = jest.fn();
        });

        it('should verify token', () => {
            authenticateToken(req, res, next);

            expect(jwtVerifyMock).toHaveBeenCalled();
            expect(res.sendStatus).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        it('should call next function if verification succeeded', () => {
            authenticateToken(req, res, next);

            expect(jwtVerifyMock).toHaveBeenCalled();
            expect(res.sendStatus).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        it('should return 401 if verification returned error', () => {
            // @ts-ignore
            jwtVerifyMock.mockImplementation((a, b, cb) => cb!(true));

            authenticateToken(req, res, next);

            expect(jwtVerifyMock).toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
