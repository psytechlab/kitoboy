import {PersonWithAvatarsView} from 'src/entities/personWithAvatarsView';
import {fetchApi} from 'src/shared/lib/fetch';

export type GetPersonWithAvatarsByPersonIdResponse = PersonWithAvatarsView;

/**
 * Получает развернутую информацию о конкретной Персоне, ее Аватарах, их Постах и Атрибутах по id Персоны
 *
 * @param id
 */
export const getPersonWithAvatarsByPersonId = async (
    id: string
): Promise<GetPersonWithAvatarsByPersonIdResponse> => {
    return fetchApi<GetPersonWithAvatarsByPersonIdResponse>({
        path: `get-person-with-avatars/${id}`,
        method: 'GET',
    });
};
