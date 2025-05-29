import {Request, Response} from 'express';

import {notFoundHandler} from '../../src/handlers';

describe('notFoundHandler', () => {
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        send: jest.fn(),
    } as unknown as Response;

    beforeEach(() => {
        req = {} as Request;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 with correct error text', () => {
        notFoundHandler(req, res);

        expect(res.send).toHaveBeenCalledWith({
            error: 'Not found',
        });
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
