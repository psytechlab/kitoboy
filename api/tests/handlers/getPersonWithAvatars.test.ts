import {Request, Response} from 'express';

import {initEmptyModels, PersonRepository} from '../../src/db';
import {getPersonWithAvatarsHandler} from '../../src/handlers';
import {PersonInstance} from '../../src/db/tables/person';
import {PERSON_WITH_AVATARS_VIEW_MOCK} from '../../src/entities/mocks/personWithAvatarsView.mock';

describe('getPersonWithAvatarsHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let findPersonMock = jest.spyOn(PersonRepository, 'findOne');

    beforeEach(() => {
        req = {
            params: {},
        } as Request;
        findPersonMock.mockResolvedValue(
            PERSON_WITH_AVATARS_VIEW_MOCK as PersonInstance
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect params', () => {
        it('should return 400 if no personId was passed', async () => {
            await getPersonWithAvatarsHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect personId',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('correct params', () => {
        beforeEach(() => {
            req.params.personId = 'passedPersonId';
        });

        it('should search for person with passed id', async () => {
            await getPersonWithAvatarsHandler(req, res);

            expect(findPersonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        id: 'passedPersonId',
                    },
                })
            );
        });

        it('should return 404 if person with passed id was not found', async () => {
            findPersonMock.mockResolvedValue(
                false as unknown as PersonInstance
            );

            await getPersonWithAvatarsHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Person not found',
            });
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return person with status, avatars, their posts, attributes and status information with code 200 ', async () => {
            await getPersonWithAvatarsHandler(req, res);

            expect(res.send).toHaveBeenCalledWith(
                PERSON_WITH_AVATARS_VIEW_MOCK
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
