import {Avatar} from 'src/entities/avatar';
import {UserSuicideStatus} from 'src/entities/status';
import {fetchApi} from 'src/shared/lib/fetch';

export type UpdateAvatarStatusResponse = Avatar;

/**
 * Изменяет статус Аватара
 *
 * @param avatarId
 * @param statusId
 */
export const updateAvatarStatus = async ({
    avatarId,
    statusId,
}: {
    avatarId: string;
    statusId: UserSuicideStatus;
}) => {
    return fetchApi<UpdateAvatarStatusResponse>({
        path: `update-avatar-status/${avatarId}`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({statusId}),
    });
};
