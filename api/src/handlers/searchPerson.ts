import {Request, Response} from 'express';
import {Op} from 'sequelize';
import {FindOptions} from 'sequelize/types/model';

import {PersonBase} from '../entities/person';
import {CommonError} from '../entities/commonError';
import {PersonRepository} from '../db';

export type SearchPersonResponse = {
    persons: PersonBase[];
};

/**
 * Ищет персон в БД по текстовой подстроке по полям name, surname и secondName и возвращает их.
 *
 * Если ошибки не произошло, возвращает 200, даже если найти персону не удалось.
 * Возвращает первые 20 совпадений.
 * Возвращает 500, если при поиске персоны произошла ошибка.
 * @param {Request} req
 * @param {Response<SearchPersonResponse | CommonError>} res
 */
export const searchPersonHandler = async (
    req: Request,
    res: Response<SearchPersonResponse | CommonError>
) => {
    try {
        const searchString = String(req.query.searchString) || '';

        const findOptions: FindOptions = {
            limit: 20,
        };

        if (searchString) {
            const preparedSearchString = `%${searchString}%`;

            findOptions.where = {
                [Op.or]: [
                    {name: {[Op.iLike]: preparedSearchString}},
                    {surname: {[Op.iLike]: preparedSearchString}},
                    {secondName: {[Op.iLike]: preparedSearchString}},
                ],
            };
        }

        const persons = await PersonRepository.findAll(findOptions);

        res.status(200).send({persons});
    } catch (err: any) {
        console.error('Error while searching person', err);

        res.status(500).json({
            error: err || 'Error while searching person',
        });
    }
};
