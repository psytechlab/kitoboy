import {Request, Response} from 'express';

import {
    AvatarRepository,
    PostRepository,
    PersonRepository,
    initEmptyModels,
} from '../../src/db';
import * as predictOnBatch from '../../src/shared/api/predictOnBatch';
import * as parseAvatarCsv from '../../src/shared/utils/parseAvatarCsv';
import {
    createAvatarHandler,
    CreateAvatarRequest,
} from '../../src/handlers/createAvatar';
import {ParsedPost} from '../../src/shared/utils/parseAvatarCsv';
import {PostInstance} from '../../src/db/tables/post';

describe('createAvatarHandler', () => {
    initEmptyModels();
    let req: Request<CreateAvatarRequest>;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let createAvatarMock = jest.spyOn(AvatarRepository, 'create');
    let createPersonMock = jest.spyOn(PersonRepository, 'create');
    let bulkCreatePostMock = jest.spyOn(PostRepository, 'bulkCreate');
    let predictOnBatchMock = jest.spyOn(predictOnBatch, 'predictOnBatch');
    let parseAvatarCsvMock = jest.spyOn(parseAvatarCsv, 'parseAvatarCsv');

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect params', () => {
        it('should return 400 if no file is provided', async () => {
            req = {
                body: {},
            } as Request<CreateAvatarRequest>;

            await createAvatarHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: {message: 'IncorrectFile'},
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should send file for parsing', async () => {
            req = {
                file: {
                    path: 'filePath',
                },
            } as Request<CreateAvatarRequest>;
            parseAvatarCsvMock.mockResolvedValue([
                {
                    postedAt: '12345',
                    text: 'post message',
                },
            ]);

            await createAvatarHandler(req, res);

            expect(parseAvatarCsvMock).toHaveBeenCalledWith('filePath');
        });

        it('should return 400 if parsing return is empty ', async () => {
            req = {
                file: {
                    path: 'filePath',
                },
            } as Request<CreateAvatarRequest>;
            parseAvatarCsvMock.mockResolvedValue(
                false as unknown as ParsedPost[]
            );

            await createAvatarHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: {message: 'IncorrectFile'},
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 500 if parsing failed', async () => {
            req = {
                file: {
                    path: 'filePath',
                },
            } as Request<CreateAvatarRequest>;
            parseAvatarCsvMock.mockImplementation(() => {
                return Promise.reject();
            });

            await createAvatarHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Error while creating avatar',
            });
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('correct params', () => {
        beforeEach(() => {
            req = {
                file: {
                    path: 'filePath',
                },
                body: {
                    surname: 'Testov',
                    name: 'Test',
                    age: '23',
                },
            } as Request<CreateAvatarRequest>;

            parseAvatarCsvMock.mockResolvedValue([
                {
                    postedAt: '12345',
                    text: 'post message',
                },
            ]);

            // @ts-ignore
            predictOnBatchMock.mockResolvedValue({});
        });

        it('should create avatar in DB with passed personId', async () => {
            req.body = {
                personId: '123',
            };

            await createAvatarHandler(req, res);

            expect(createAvatarMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    personId: '123',
                })
            );
        });

        it('should create person in DB if no personId was passed', async () => {
            await createAvatarHandler(req, res);

            expect(createPersonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    surname: 'Testov',
                    name: 'Test',
                    age: '23',
                })
            );
        });

        it('should create person in DB with default status', async () => {
            await createAvatarHandler(req, res);

            expect(createPersonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusId: 'not_set',
                })
            );
        });

        it('should create avatar in DB with id of created person if no personId was passed', async () => {
            createPersonMock.mockResolvedValue({id: 'createdPersonId'});

            await createAvatarHandler(req, res);

            expect(createAvatarMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    personId: 'createdPersonId',
                })
            );
        });

        it('should create avatar in DB with default status', async () => {
            createPersonMock.mockResolvedValue({id: 'createdPersonId'});

            await createAvatarHandler(req, res);

            expect(createAvatarMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusId: 'not_set',
                })
            );
        });

        it('should create posts in DB with id of created avatar', async () => {
            createPersonMock.mockResolvedValue({id: 'createdPersonId'});
            createAvatarMock.mockResolvedValue({id: 'createdAvatarId'});

            await createAvatarHandler(req, res);

            expect(bulkCreatePostMock).toHaveBeenCalledWith(
                expect.objectContaining([
                    {
                        postedAt: '12345',
                        text: 'post message',
                        avatarId: 'createdAvatarId',
                    },
                ])
            );
        });

        it('should return 400 if posts creation failed', async () => {
            createPersonMock.mockResolvedValue({id: 'createdPersonId'});
            createAvatarMock.mockResolvedValue({id: 'createdAvatarId'});
            bulkCreatePostMock.mockResolvedValue(
                false as unknown as PostInstance[]
            );

            await createAvatarHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect posts params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should send created posts to Zoo for prediction', async () => {
            createPersonMock.mockResolvedValue({id: 'createdPersonId'});
            createAvatarMock.mockResolvedValue({id: 'createdAvatarId'});
            bulkCreatePostMock.mockResolvedValue([
                {
                    id: 'postId',
                    text: 'post text',
                } as PostInstance,
            ]);

            await createAvatarHandler(req, res);

            expect(predictOnBatchMock).toHaveBeenCalledWith({
                texts: [{text_id: 'postId', text: 'post text'}],
            });
        });

        it('should return 201 with id of created avatar if sending posts for prediction succeeded', async () => {
            createPersonMock.mockResolvedValue({id: 'createdPersonId'});
            createAvatarMock.mockResolvedValue({id: 'createdAvatarId'});
            bulkCreatePostMock.mockResolvedValue([
                {
                    id: 'postId',
                    text: 'post text',
                } as PostInstance,
            ]);

            await createAvatarHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                id: 'createdAvatarId',
            });
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });
});
