import {Attribute} from 'src/entities/attribute';
import {fetchApi} from 'src/shared/lib/fetch';

export type GetAttributesResponse = {
    attributes: Attribute[];
};

/**
 * Получает данные обо всех Атрибутах в системе
 */
export const getAttributes = async () => {
    return fetchApi<GetAttributesResponse>({
        path: 'get-attributes',
        method: 'GET',
    });
};
