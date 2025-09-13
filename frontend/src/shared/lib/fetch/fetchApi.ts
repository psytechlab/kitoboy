import {API_TOKEN_NAME, ROUTER_BASE_NAME} from 'src/shared/consts';
import {showToastError} from 'src/shared/lib/showToast';

import {ErrorOptionsByStatusCode} from './types';
import {fetchKitoboy} from '.';

/**
 * Обработчик отправки запроса к сервису API.
 * Содержит обработку ошибок авторизации и редирект на страницу логина, а также показ нотификации об ошибке.
 *
 * @param path
 * @param method
 * @param body
 * @param headers
 */
export async function fetchApi<T>({
    path,
    method = 'POST',
    body,
    headers,
}: {
    path: string;
    method?: string;
    body?: BodyInit;
    headers?: HeadersInit;
    errorOptions?: ErrorOptionsByStatusCode;
}) {
    const token = localStorage.getItem(API_TOKEN_NAME);

    if (token) {
        headers = {
            ...headers,
            Authorization: `Bearer ${token}`,
        };
    }

    return fetchKitoboy<T>(`http://${import.meta.env.VITE_APP_HOST}:3052/${path}`, {
        method,
        body,
        headers,
    }).catch(err => {
        const {data: errorData, status} = err;

        if (status === 401) {
            location?.replace(`${ROUTER_BASE_NAME}/login`);

            return;
        }

        let errorText = '';

        if (errorData) {
            const {error: errorMessage} = errorData;

            errorText = errorMessage || '';
        }

        showToastError(errorText);

        throw err;
    });
}
