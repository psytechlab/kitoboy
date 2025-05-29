import {Request, Response} from 'express';

import {initEmptyModels, PersonRepository} from '../../src/db';
import {updatePersonHandler} from '../../src/handlers';
import {PERSON_MOCK} from '../../src/entities/mocks/person.mock';
import {PersonInstance} from '../../src/db/tables/person';

describe('updatePersonHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let updatePersonMock = jest.spyOn(PersonRepository, 'update');

    beforeEach(() => {
        req = {
            body: {},
            params: {},
        } as Request;
        updatePersonMock.mockResolvedValue([
            1,
            // @ts-ignore
            [PERSON_MOCK as PersonInstance],
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('incorrect params', () => {
        it('should return 400 if personId was not passed', async () => {
            req.body.name = 'name';

            await updatePersonHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if body was not passed', async () => {
            req.params.personId = 'personId';

            await updatePersonHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect body params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if no correct field names were passed in body', async () => {
            req.params.personId = 'personId';
            req.body.test = 'test';

            await updatePersonHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect body params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('correct params', () => {
        beforeEach(() => {
            req.params.personId = 'personId';
            req.body = {
                name: 'name',
                age: '23',
            };
        });

        it('should update Person with passed id by passed fields', async () => {
            await updatePersonHandler(req, res);

            expect(updatePersonMock).toHaveBeenCalledWith(
                {
                    name: 'name',
                    age: '23',
                },
                {
                    where: {
                        id: 'personId',
                    },
                    returning: true,
                }
            );
        });

        it('should return 500 if update failed', async () => {
            updatePersonMock.mockImplementation(() => {
                return Promise.reject();
            });

            await updatePersonHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Error while updating person',
            });
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should return 400 if Person with passed Id was not found', async () => {
            // @ts-ignore
            updatePersonMock.mockResolvedValue([0, []]);

            await updatePersonHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Error while updating person',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return updated Person with status 200', async () => {
            await updatePersonHandler(req, res);

            expect(res.send).toHaveBeenCalledWith(PERSON_MOCK);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
