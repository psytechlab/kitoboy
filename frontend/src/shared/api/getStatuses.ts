import {Status} from 'src/entities/status';
import {fetchApi} from 'src/shared/lib/fetch';

export type GetStatusesResponse = {
    statuses: Status[];
};

/**
 * Получает данные обо всех Статусах
 */
export const getStatuses = async () => {
    return fetchApi<GetStatusesResponse>({
        path: 'get-statuses',
        method: 'GET',
    });
};
