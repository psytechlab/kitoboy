import {PersonView} from 'src/entities/personView';
import {fetchApi} from 'src/shared/lib/fetch';

export type SearchPersonResponse = {persons: PersonView[]};

/**
 * Осуществляет текстовый поиск Персоны
 *
 * @param searchString
 */
export const searchPerson = async (
    searchString: string
): Promise<SearchPersonResponse> => {
    return fetchApi<SearchPersonResponse>({
        path: `search-person?searchString=${searchString}`,
        method: 'GET',
    });
};
