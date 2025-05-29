import {Request, Response} from 'express';
import {Op} from 'sequelize';

import {initEmptyModels, PersonRepository} from '../../src/db';
import {searchPersonHandler} from '../../src/handlers';
import {PersonInstance} from '../../src/db/tables/person';
import {PERSON_MOCK} from '../../src/entities/mocks/person.mock';

describe('searchPersonHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let findPersonsMock = jest.spyOn(PersonRepository, 'findAll');

    beforeEach(() => {
        req = {
            query: {
                searchString: '123',
            },
        } as unknown as Request;
        findPersonsMock.mockResolvedValue([PERSON_MOCK as PersonInstance]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should search for persons in DB by surname, name and secondName using passed searchString as substring', async () => {
        const searchString = '%123%';

        await searchPersonHandler(req, res);

        expect(findPersonsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    [Op.or]: [
                        {name: {[Op.iLike]: searchString}},
                        {surname: {[Op.iLike]: searchString}},
                        {secondName: {[Op.iLike]: searchString}},
                    ],
                },
            })
        );
    });

    it('should select 20 persons from db', async () => {
        await searchPersonHandler(req, res);

        expect(findPersonsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                limit: 20,
            })
        );
    });

    it('should return 500 if error occurred during search', async () => {
        findPersonsMock.mockImplementation(() => {
            return Promise.reject();
        });

        await searchPersonHandler(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: 'Error while searching person',
        });
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return persons with code 200 ', async () => {
        await searchPersonHandler(req, res);

        expect(res.send).toHaveBeenCalledWith({
            persons: [PERSON_MOCK],
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
