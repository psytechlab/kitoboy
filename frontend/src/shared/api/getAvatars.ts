import {AvatarView} from 'src/entities/avatarView';
import {fetchApi} from 'src/shared/lib/fetch';

export type GetAvatarsResponse = {
    avatars: AvatarView[];
};

/**
 * Получает данные обо всех Аватарах, их Статусах, Постах и Атрибутах с учетом пагинации
 *
 * @param page
 * @param size
 */
export const getAvatars = async ({
    page,
    size,
}: {
    page: number;
    size: number;
}) => {
    return fetchApi<GetAvatarsResponse>({
        path: 'get-avatars',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({page, size}),
    });
};
