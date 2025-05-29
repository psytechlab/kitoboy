import {Request, Response} from 'express';

import {CommonError} from '../entities/commonError';
import {Person} from '../entities/person';
import {PersonRepository} from '../db';

export type UpdatePersonStatusResponse = Person;

/**
 * Изменяет статус Персоны с переданным id.
 *
 * Возвращает 400, если не переданы personId или statusId, а также в случае ошибки.
 * Возвращает персону с обновленным статусом и код 200 в случае успеха.
 * @param {Request} req
 * @param {Response<UpdatePersonStatusResponse | CommonError>} res
 */
export const updatePersonStatusHandler = async (
    req: Request,
    res: Response<UpdatePersonStatusResponse | CommonError>
) => {
    try {
        const personId = req.params?.personId;
        const statusId = req?.body?.statusId;

        if (!personId || !statusId) {
            res.status(400).send({
                error: 'Incorrect params',
            });

            return;
        }

        const [rowsChanged, updatedPersons] = await PersonRepository.update(
            {statusId},
            {
                where: {
                    id: personId,
                },
                returning: true,
            }
        );

        if (!rowsChanged || !updatedPersons?.length) {
            res.status(400).send({
                error: 'Error while updating person status',
            });

            return;
        }

        res.status(200).send(updatedPersons[0] as Person);
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while updating person status',
        });
    }
};
