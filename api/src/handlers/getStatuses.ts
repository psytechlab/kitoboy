import {Request, Response} from 'express';

import {Status} from '../entities/status';
import {CommonError} from '../entities/commonError';
import {StatusRepository} from '../db';

export type GetStatusesResponse = {
    statuses: Status[];
};

/**
 * Возвращает все статусы из БД.
 *
 * @param {Request} req
 * @param {Response<GetStatusesResponse | CommonError>} res
 */
export const getStatusesHandler = async (
    req: Request,
    res: Response<GetStatusesResponse | CommonError>
) => {
    try {
        const statuses = await StatusRepository.findAll({
            limit: 100,
        });

        if (!statuses) {
            res.status(400).send({
                error: 'Error while getting statuses',
            });

            return;
        }

        res.status(200).send({
            statuses: statuses as Status[],
        });
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while getting statuses',
        });
    }
};
