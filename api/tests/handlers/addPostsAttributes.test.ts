import {Request, Response} from 'express';

import {
    initEmptyModels,
    AttributeRepository,
    PostAttributeRepository,
    PostRepository,
} from '../../src/db';
import {
    addPostsAttributesHandler,
    AddPostsAttributesRequest,
} from '../../src/handlers/addPostsAttributes';
import {AttributeInstance} from '../../src/db/tables/attribute';
import {PostInstance} from '../../src/db/tables/post';

describe('addPostsAttributesHandler', () => {
    initEmptyModels();
    let req: Request<AddPostsAttributesRequest>;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        send: jest.fn(),
    } as unknown as Response;
    let createAttributeMock = jest.spyOn(AttributeRepository, 'create');
    let findAttributeMock = jest.spyOn(AttributeRepository, 'findOne');
    let bulkCreatePostAttributeMock = jest.spyOn(
        PostAttributeRepository,
        'bulkCreate'
    );
    let findPostMock = jest.spyOn(PostRepository, 'findOne');

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect params', () => {
        it('should return 400 if params are empty', async () => {
            req = {
                body: {},
            } as Request<AddPostsAttributesRequest>;

            await addPostsAttributesHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if texts array is empty', async () => {
            req = {
                body: {
                    texts: [],
                },
            } as Request<AddPostsAttributesRequest>;

            await addPostsAttributesHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('correct params', () => {
        beforeEach(() => {
            req = {
                body: {
                    texts: [
                        {
                            id: '123',
                            predictions: [
                                {
                                    prediction: 'first prediction',
                                    color: '#FFF',
                                },
                            ],
                        },
                    ],
                },
            } as Request<AddPostsAttributesRequest>;

            findAttributeMock.mockResolvedValue(null);
            createAttributeMock.mockResolvedValue(null);
            bulkCreatePostAttributeMock.mockResolvedValue([]);
            findPostMock.mockResolvedValue(null);
        });

        it('should search for Attribute with passed color and text in DB', async () => {
            findAttributeMock.mockResolvedValue(null);

            await addPostsAttributesHandler(req, res);

            expect(findAttributeMock).toHaveBeenCalledWith({
                where: {
                    name: 'first prediction',
                    color: '#FFF',
                },
            });
        });

        it('should create Attribute with passed color and text in DB in none was found', async () => {
            findAttributeMock.mockResolvedValue(null);
            createAttributeMock.mockResolvedValue({id: 'first'});

            await addPostsAttributesHandler(req, res);

            expect(createAttributeMock).toHaveBeenCalledWith({
                name: 'first prediction',
                color: '#FFF',
            });
        });

        it('should create record in PostAttribute with id of created attribute and passed post id if no attribute was found', async () => {
            findAttributeMock.mockResolvedValue(null);
            createAttributeMock.mockResolvedValue({id: 'first'});
            bulkCreatePostAttributeMock.mockResolvedValue([]);

            await addPostsAttributesHandler(req, res);

            expect(bulkCreatePostAttributeMock).toHaveBeenCalledWith([
                {
                    postId: '123',
                    attributeId: 'first',
                },
            ]);
        });

        it('should create record in PostAttribute with id of found attribute and passed post id if attribute was found', async () => {
            findAttributeMock.mockResolvedValue({
                id: 'foundAttrId',
            } as AttributeInstance);
            bulkCreatePostAttributeMock.mockResolvedValue([]);

            await addPostsAttributesHandler(req, res);

            expect(createAttributeMock).not.toHaveBeenCalled();
            expect(bulkCreatePostAttributeMock).toHaveBeenCalledWith([
                {
                    postId: '123',
                    attributeId: 'foundAttrId',
                },
            ]);
        });

        it('should search posts with passed text ids after creating records in PostAttribute', async () => {
            findAttributeMock.mockResolvedValue({
                id: 'foundAttrId',
            } as AttributeInstance);
            bulkCreatePostAttributeMock.mockResolvedValue([]);
            findPostMock.mockResolvedValue({} as PostInstance);

            await addPostsAttributesHandler(req, res);

            expect(findPostMock).toHaveBeenCalledWith({
                where: {
                    id: '123',
                },
            });
        });

        it('should return posts with passed text ids and status 202 on success', async () => {
            findAttributeMock.mockResolvedValue({
                id: 'foundAttrId',
            } as AttributeInstance);
            bulkCreatePostAttributeMock.mockResolvedValue([]);
            findPostMock.mockResolvedValue({id: '123'} as PostInstance);

            await addPostsAttributesHandler(req, res);

            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    posts: [{id: '123'}],
                })
            );
            expect(res.status).toHaveBeenCalledWith(202);
        });
    });
});
