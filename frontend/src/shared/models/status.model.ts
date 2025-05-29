import {createEffect, createEvent, createStore, sample} from 'effector';

import {Status, UserSuicideStatus} from 'src/entities/status';
import {
    getStatuses as fetchGetStatuses,
    GetStatusesResponse,
} from 'src/shared/api/getStatuses';
import {
    updateAvatarStatus as fetchUpdateAvatarStatus,
    UpdateAvatarStatusResponse,
} from 'src/shared/api/updateAvatarStatus';
import {
    updatePersonStatus as fetchUpdatePersonStatus,
    UpdatePersonStatusResponse,
} from 'src/shared/api/updatePersonStatus';

export const downloadStatuses = createEvent();

export const setAvatarStatus = createEvent<{
    avatarId: string;
    statusId: UserSuicideStatus;
}>();

export const setPersonStatus = createEvent<{
    personId: string;
    statusId: UserSuicideStatus;
}>();

export const $statuses = createStore<Status[]>([]);

export const $statusChanged = createStore(false);

const downloadStatusesFx = createEffect(
    async (): Promise<GetStatusesResponse> => fetchGetStatuses()
);

const setAvatarStatusFx = createEffect(
    async ({
        avatarId,
        statusId,
    }: {
        avatarId: string;
        statusId: UserSuicideStatus;
    }): Promise<UpdateAvatarStatusResponse> =>
        fetchUpdateAvatarStatus({avatarId, statusId})
);

const setPersonStatusFx = createEffect(
    async ({
        personId,
        statusId,
    }: {
        personId: string;
        statusId: UserSuicideStatus;
    }): Promise<UpdatePersonStatusResponse> =>
        fetchUpdatePersonStatus({personId, statusId})
);

sample({
    clock: downloadStatuses,
    target: downloadStatusesFx,
});

sample({
    clock: downloadStatusesFx.doneData,
    fn: response => response.statuses,
    target: $statuses,
});

sample({
    clock: setAvatarStatus,
    target: setAvatarStatusFx,
});

sample({
    clock: setAvatarStatusFx.doneData,
    fn: () => true,
    target: $statusChanged,
});

sample({
    clock: setPersonStatus,
    target: setPersonStatusFx,
});

sample({
    clock: setPersonStatusFx.doneData,
    fn: () => true,
    target: $statusChanged,
});

/**
 * Модель для хранения и изменения Статуса Аватара или Персоны
 */
export const statusModel = {
    stores: {
        $statuses,
        $statusChanged,
    },
    events: {
        downloadStatuses,
        setAvatarStatus,
        setPersonStatus,
    },
};
