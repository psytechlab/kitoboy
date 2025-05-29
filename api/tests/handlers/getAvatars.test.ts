import {Request, Response} from 'express';

import {AvatarRepository, initEmptyModels} from '../../src/db';
import {getAvatarsHandler} from '../../src/handlers';
import {AvatarInstance} from '../../src/db/tables/avatar';
import {AVATAR_VIEW_MOCK} from '../../src/entities/mocks/avatarView.mock';
import {PERSON_MOCK} from '../../src/entities/mocks/person.mock';

describe('getAvatarsHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let findAndCountAllAvatarsMock = jest.spyOn(
        AvatarRepository,
        'findAndCountAll'
    );

    beforeEach(() => {
        req = {
            params: {},
            body: {},
        } as Request;
        // @ts-ignore
        findAndCountAllAvatarsMock.mockResolvedValue({
            rows: [
                {
                    ...AVATAR_VIEW_MOCK,
                    person: {
                        id: PERSON_MOCK.id,
                        surname: PERSON_MOCK.surname,
                        name: PERSON_MOCK.name,
                        secondName: PERSON_MOCK.secondName,
                        age: PERSON_MOCK.age,
                    },
                },
            ],
            count: 1,
        } as {rows: AvatarInstance[]; count: number});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('personId passed', () => {
        beforeEach(() => {
            req.params.personId = 'passedPersonId';
        });

        it.skip('should search for avatars with filter by person', async () => {
            await getAvatarsHandler(req, res);

            expect(findAndCountAllAvatarsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining([
                        expect.objectContaining({
                            as: 'person',
                            where: {
                                id: 'passedPersonId',
                            },
                        }),
                    ]),
                })
            );
        });
    });

    describe('personId not passed', () => {
        it('should search for avatars without filter by person', async () => {
            await getAvatarsHandler(req, res);

            expect(findAndCountAllAvatarsMock).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    include: [
                        {
                            as: 'person',
                            id: 'passedPersonId',
                        },
                    ],
                })
            );
        });

        it('should search for avatars using pagination params from body', async () => {
            req.body = {
                size: 20,
                page: 3,
            };

            await getAvatarsHandler(req, res);

            expect(findAndCountAllAvatarsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: [['createdAt', 'DESC']],
                    limit: 20,
                    offset: 40,
                })
            );
        });

        it('should return 500 if search failed', async () => {
            findAndCountAllAvatarsMock.mockImplementation(() => {
                return Promise.reject();
            });

            await getAvatarsHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Error while selecting avatars',
            });
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should return avatars with person, posts and status information', async () => {
            await getAvatarsHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                avatars: [
                    {
                        ...AVATAR_VIEW_MOCK,
                        person: {
                            id: PERSON_MOCK.id,
                            surname: PERSON_MOCK.surname,
                            name: PERSON_MOCK.name,
                            secondName: PERSON_MOCK.secondName,
                            age: PERSON_MOCK.age,
                        },
                    },
                ],
                page: 1,
                pages: 1,
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
