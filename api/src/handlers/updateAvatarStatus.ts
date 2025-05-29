import {Request, Response} from 'express';

import {Avatar} from '../entities/avatar';
import {CommonError} from '../entities/commonError';
import {AvatarRepository} from '../db';

export type UpdateAvatarStatusResponse = Avatar;

/**
 * Изменяет статус Аватара с переданным id.
 *
 * Возвращает 400, если не переданы avatarId или statusId, а также в случае ошибки.
 * Возвращает аватар с обновленным статусом и код 200 в случае успеха.
 * @param {Request} req
 * @param {Response<UpdateAvatarStatusResponse | CommonError>} res
 */
export const updateAvatarStatusHandler = async (
    req: Request,
    res: Response<UpdateAvatarStatusResponse | CommonError>
) => {
    try {
        const avatarId = req.params?.avatarId;
        const statusId = req?.body?.statusId;

        if (!avatarId || !statusId) {
            res.status(400).send({
                error: 'Incorrect params',
            });

            return;
        }

        const [rowsChanged, updatedAvatars] = await AvatarRepository.update(
            {statusId},
            {
                where: {
                    id: avatarId,
                },
                returning: true,
            }
        );

        if (!rowsChanged || !updatedAvatars?.length) {
            res.status(400).send({
                error: 'Error while updating avatar status',
            });

            return;
        }

        res.status(200).send(updatedAvatars[0] as Avatar);
    } catch (err: any) {
        res.status(500).json({
            error: err || 'Error while updating avatar status',
        });
    }
};
