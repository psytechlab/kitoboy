import {Request, Response} from 'express';

import {Attribute} from '../entities/attribute';
import {CommonError} from '../entities/commonError';
import {AttributeRepository} from '../db';

export type GetAttributesResponse = {
    attributes: Attribute[];
};

/**
 * Возвращает первые 100 атрибутов из БД.
 *
 * @param {Request} req
 * @param {Response<GetAttributesResponse | CommonError>} res
 */
export const getAttributesHandler = async (
    req: Request,
    res: Response<GetAttributesResponse | CommonError>
) => {
    try {
        const attributes = await AttributeRepository.findAll({
            limit: 100,
        });

        if (!attributes) {
            res.status(400).send({
                error: 'Error while getting attributes',
            });
        }

        res.status(200).send({
            attributes: attributes as Attribute[],
        });
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while getting attributes',
        });
    }
};
