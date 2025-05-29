import {createEffect, createEvent, createStore, sample} from 'effector';

import {getAvatars, GetAvatarsResponse} from 'src/shared/api/getAvatars';
import {AvatarView} from 'src/entities/avatarView';

type PaginationData = {
    page: number;
    pages: number;
};

export const AVATARS_PER_PAGE = 30;

export const clearLoadedAvatars = createEvent();

export const downloadAvatars = createEvent();

export const downloadAvatarsPage = createEvent<number>();

export const resetPagination = createEvent();

export const $avatars = createStore<AvatarView[] | null>(null).reset(
    clearLoadedAvatars
);

export const $paginationData = createStore<PaginationData | null>(null).reset(
    resetPagination
);

export const $allAvatarsLoaded = createStore<boolean>(false);

const downloadAvatarsFx = createEffect(
    async (page: number | null): Promise<GetAvatarsResponse> => {
        return getAvatars({page: page || 1, size: AVATARS_PER_PAGE});
    }
);

sample({
    clock: downloadAvatars,
    source: {
        pagination: $paginationData,
    },
    fn: ({pagination}) => {
        return pagination?.page || null;
    },
    target: downloadAvatarsFx,
});

sample({
    clock: downloadAvatarsPage,
    target: downloadAvatarsFx,
});

sample({
    clock: downloadAvatarsFx.doneData,
    fn: response => response.avatars,
    target: $avatars,
});

sample({
    clock: downloadAvatarsFx.doneData,
    fn: response => ({
        page: response.page,
        pages: response.pages,
    }),
    target: $paginationData,
});

sample({
    clock: $paginationData,
    fn: paginationData => {
        if (paginationData) {
            return paginationData?.page > paginationData?.pages;
        }

        return false;
    },
    target: $allAvatarsLoaded,
});

sample({
    clock: downloadAvatarsFx.fail,
    fn: () => true,
    target: $allAvatarsLoaded,
});

/**
 * Модель для хранения данных об списке Аватаров и обработке их Постов, с учетом пагинации
 */
export const avatarsModel = {
    stores: {
        $avatars,
        $allAvatarsLoaded,
        $paginationData,
    },
    events: {
        clearLoadedAvatars,
        downloadAvatars,
        downloadAvatarsPage,
        resetPagination,
    },
};
