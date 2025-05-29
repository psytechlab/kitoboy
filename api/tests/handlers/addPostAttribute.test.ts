import {Request, Response} from 'express';

import {initEmptyModels, PostAttributeRepository} from '../../src/db';
import {addPostAttributeHandler} from '../../src/handlers';

describe('addPostAttributeHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        send: jest.fn(),
    } as unknown as Response;
    let createPostAttributeMock = jest.spyOn(PostAttributeRepository, 'create');

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect params', () => {
        it('should return 400 if params are empty', async () => {
            req = {
                params: {},
                body: {},
            } as Request;

            await addPostAttributeHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if postId is empty', async () => {
            req = {
                params: {},
                body: {
                    attributeId: '123',
                },
            } as Request;

            await addPostAttributeHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if attributeId is empty', async () => {
            req = {
                params: {},
                body: {},
            } as Request;
            req.params.postId = 'abc';

            await addPostAttributeHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('correct params', () => {
        beforeEach(() => {
            req = {
                params: {},
                body: {
                    attributeId: '123',
                },
            } as Request;
            req.params.postId = 'abc';
        });

        it('should create record in PostAttribute table with attributeId and postId', async () => {
            createPostAttributeMock.mockResolvedValue({});

            await addPostAttributeHandler(req, res);

            expect(createPostAttributeMock).toHaveBeenCalledWith({
                attributeId: '123',
                postId: 'abc',
            });
        });

        it('should return 500 on error while connecting post with attribute', async () => {
            createPostAttributeMock.mockResolvedValue(null);

            await addPostAttributeHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Error while creating post-attribute connection',
            });
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should return 202 on success', async () => {
            createPostAttributeMock.mockResolvedValue({});

            await addPostAttributeHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(202);
        });
    });
});
