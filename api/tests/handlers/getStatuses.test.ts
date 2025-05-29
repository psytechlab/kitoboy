import {Request, Response} from 'express';

import {initEmptyModels, StatusRepository} from '../../src/db';
import {getStatusesHandler} from '../../src/handlers';
import {STATUS_MOCK} from '../../src/entities/mocks/status.mock';
import {StatusInstance} from '../../src/db/tables/status';

describe('getStatusesHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let findStatusesMock = jest.spyOn(StatusRepository, 'findAll');

    beforeEach(() => {
        req = {
            params: {},
        } as Request;
        findStatusesMock.mockResolvedValue([STATUS_MOCK as StatusInstance]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should select 100 statuses from db', async () => {
        await getStatusesHandler(req, res);

        expect(findStatusesMock).toHaveBeenCalledWith({
            limit: 100,
        });
    });

    it('should return 400 if no statuses were found', async () => {
        findStatusesMock.mockResolvedValue(
            false as unknown as StatusInstance[]
        );

        await getStatusesHandler(req, res);

        expect(res.send).toHaveBeenCalledWith({
            error: 'Error while getting statuses',
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return statuses with code 200 ', async () => {
        await getStatusesHandler(req, res);

        expect(res.send).toHaveBeenCalledWith({
            statuses: [STATUS_MOCK],
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
