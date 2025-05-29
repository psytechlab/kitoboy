import {Request, Response} from 'express';

import {AvatarRepository, initEmptyModels} from '../../src/db';
import {getAvatarHandler} from '../../src/handlers';
import {AvatarInstance} from '../../src/db/tables/avatar';
import {AVATAR_VIEW_MOCK} from '../../src/entities/mocks/avatarView.mock';
import {PERSON_MOCK} from '../../src/entities/mocks/person.mock';

describe('getAvatarHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let findAvatarMock = jest.spyOn(AvatarRepository, 'findOne');

    beforeEach(() => {
        req = {
            params: {},
        } as Request;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect params', () => {
        it('should return 400 if avatarId was not passed', async () => {
            await getAvatarHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect avatarId',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('correct params', () => {
        beforeEach(() => {
            req.params.avatarId = 'testAvatarId';
        });

        it('should search for avatar with passed id', async () => {
            findAvatarMock.mockResolvedValue({} as AvatarInstance);

            await getAvatarHandler(req, res);

            expect(findAvatarMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {id: 'testAvatarId'},
                })
            );
        });

        it('should return 404 if avatar was not found', async () => {
            findAvatarMock.mockResolvedValue(
                false as unknown as AvatarInstance
            );

            await getAvatarHandler(req, res);

            expect(res.send).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return avatar with person, posts and status information', async () => {
            findAvatarMock.mockResolvedValue(
                AVATAR_VIEW_MOCK as AvatarInstance
            );

            await getAvatarHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                ...AVATAR_VIEW_MOCK,
                person: {
                    id: PERSON_MOCK.id,
                    surname: PERSON_MOCK.surname,
                    name: PERSON_MOCK.name,
                    secondName: PERSON_MOCK.secondName,
                    age: PERSON_MOCK.age,
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
