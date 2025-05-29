import {Request, Response} from 'express';

import {PersonRepository, initEmptyModels} from '../../src/db';
import {updatePersonStatusHandler} from '../../src/handlers';
import {PERSON_MOCK} from '../../src/entities/mocks/person.mock';
import {PersonInstance} from '../../src/db/tables/person';

describe('updatePersonStatusHandler', () => {
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
            req.body.statusId = 'statusId';

            await updatePersonStatusHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if statusId was not passed', async () => {
            req.params.personId = 'personId';

            await updatePersonStatusHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Incorrect params',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('correct params', () => {
        beforeEach(() => {
            req.body.statusId = 'statusId';
            req.params.personId = 'personId';
        });

        it('should update Person with passed id by passed statusId', async () => {
            await updatePersonStatusHandler(req, res);

            expect(updatePersonMock).toHaveBeenCalledWith(
                {statusId: 'statusId'},
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

            await updatePersonStatusHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: 'Error while updating person status',
            });
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should return 400 if Person with passed Id was not found', async () => {
            // @ts-ignore
            updatePersonMock.mockResolvedValue([0, []]);

            await updatePersonStatusHandler(req, res);

            expect(res.send).toHaveBeenCalledWith({
                error: 'Error while updating person status',
            });
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return updated Person with status 200', async () => {
            await updatePersonStatusHandler(req, res);

            expect(res.send).toHaveBeenCalledWith(PERSON_MOCK);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
