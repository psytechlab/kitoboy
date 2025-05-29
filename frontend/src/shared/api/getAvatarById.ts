import {AvatarView} from 'src/entities/avatarView';
import {fetchApi} from 'src/shared/lib/fetch';

export type GetAvatarByIdResponse = AvatarView;

/**
 * Получает данные о конкретном Аватаре, его Статусе, Постах и Атрибутах по id Аватара
 *
 * @param id
 */
export const getAvatarById = async (
    id: string
): Promise<GetAvatarByIdResponse> => {
    return fetchApi<GetAvatarByIdResponse>({
        path: `get-avatar/${id}`,
        method: 'GET',
    });
};
