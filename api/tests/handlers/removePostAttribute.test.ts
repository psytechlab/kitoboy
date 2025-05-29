import {Request, Response} from 'express';

import {initEmptyModels, PostAttributeRepository} from '../../src/db';
import {removePostAttributeHandler} from '../../src/handlers';
import {PostAttributeInstance} from '../../src/db/tables/postAttribute';

describe('removePostAttributeHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let destroyEntityMock = jest.fn().mockImplementation(() => {});
    let findPostAttributeMock = jest.spyOn(PostAttributeRepository, 'findOne');

    beforeEach(() => {
        req = {
            body: {},
            params: {},
        } as Request;
        findPostAttributeMock.mockResolvedValue({
            postId: 'postId',
            attributeId: 'attributeId',
            destroy: destroyEntityMock,
        } as unknown as PostAttributeInstance);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect params', () => {
        it('should return 400 if no postId was passed', async () => {
            req.body = {
                attributeId: 'attributeId',
            };

            await removePostAttributeHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if no attributeId was passed', async () => {
            req.params.postId = 'postId';

            await removePostAttributeHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('correct params', () => {
        beforeEach(() => {
            req.body = {
                attributeId: 'attributeId',
            };
            req.params.postId = 'postId';
        });

        it('should search for postAttribute with passed postId and attributeId', async () => {
            await removePostAttributeHandler(req, res);

            expect(findPostAttributeMock).toHaveBeenCalledWith({
                where: {
                    postId: 'postId',
                    attributeId: 'attributeId',
                },
            });
        });

        it('should return 404 if postAttribute with passed postId and attributeId was not found', async () => {
            findPostAttributeMock.mockResolvedValue(
                false as unknown as PostAttributeInstance
            );

            await removePostAttributeHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: `Attribute attributeId not found at post postId`,
            });
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should destroy entity if found', async () => {
            await removePostAttributeHandler(req, res);

            expect(destroyEntityMock).toHaveBeenCalled();
        });

        it('should return code 200 if postAttribute was found and destroyed', async () => {
            await removePostAttributeHandler(req, res);

            expect(res.send).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
