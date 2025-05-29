import {Request, Response} from 'express';

import {CommonError} from '../entities/commonError';
import {PersonView} from '../entities/personView';
import {PersonRepository} from '../db';

export type UpdatePersonResponse = PersonView;

/**
 * Изменяет Персону с переданным id данными из body.
 *
 * Возвращает 400, если не передан personId или корректные поля в body, а также в случае ошибки.
 * Возвращает персону с обновленными полями и код 200 в случае успеха.
 * @param {Request} req
 * @param {Response<UpdateAvatarStatusResponse | CommonError>} res
 */
export const updatePersonHandler = async (
    req: Request,
    res: Response<UpdatePersonResponse | CommonError>
) => {
    try {
        const personId = req.params?.personId;
        const body = req.body;

        if (!personId || !body) {
            res.status(400).send({
                error: 'Incorrect params',
            });

            return;
        }

        const changeableFields = [
            'surname',
            'name',
            'secondName',
            'age',
            'address',
            'phone',
            'organization',
            'description',
        ];

        const changes: any = {};

        for (let fieldName of changeableFields) {
            const newValue = body[fieldName];
            if (newValue !== undefined) {
                changes[fieldName] = newValue;
            }
        }

        if (!Object.keys(changes)?.length) {
            res.status(400).send({
                error: 'Incorrect body params',
            });

            return;
        }

        const [rowsChanged, updatedPersons] = await PersonRepository.update(
            changes,
            {
                where: {
                    id: personId,
                },
                returning: true,
            }
        );

        if (!rowsChanged || !updatedPersons?.length) {
            res.status(400).send({
                error: 'Error while updating person',
            });

            return;
        }

        res.status(200).send(updatedPersons[0]);
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while updating person',
        });
    }
};
