import {Request, Response} from 'express';

import {AttributeRepository, initEmptyModels} from '../../src/db';
import {AttributeInstance} from '../../src/db/tables/attribute';
import {getAttributesHandler} from '../../src/handlers';

describe('getAttributesHandler', () => {
    initEmptyModels();
    let req: Request;
    let res = {
        status: jest.fn().mockImplementation(() => res),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
    let findAttributesMock = jest.spyOn(AttributeRepository, 'findAll');

    beforeEach(() => {
        req = {
            body: {},
        } as Request;
        findAttributesMock.mockResolvedValue([
            {
                id: '123',
                name: ' attribute name',
                color: '#FFF',
            } as AttributeInstance,
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should search for attributes with correct params', async () => {
        await getAttributesHandler(req, res);

        expect(findAttributesMock).toHaveBeenCalledWith({
            limit: 100,
        });
    });

    it('should return 400 if selecting attributes failed', async () => {
        findAttributesMock.mockResolvedValue(
            false as unknown as AttributeInstance[]
        );

        await getAttributesHandler(req, res);

        expect(res.send).toHaveBeenCalledWith({
            error: 'Error while getting attributes',
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 200 with attributes found', async () => {
        await getAttributesHandler(req, res);

        expect(res.send).toHaveBeenCalledWith({
            attributes: [
                {
                    id: '123',
                    name: ' attribute name',
                    color: '#FFF',
                },
            ],
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
