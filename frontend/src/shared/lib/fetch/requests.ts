import {ErrorData, ExtendedError, FetchInput} from './types';

/**
 * Обрабатывает успешный ответ бэкенда, распаковывает из него данные в формате, соответствующем заголовку ответа
 *
 * @param response
 */
export const processResponse = async <T>(
    response: Response
): Promise<T | ErrorData> => {
    const {headers} = response;
    const contentType = headers.get('Content-Type');
    const parsedResponse = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

    return parsedResponse as T | ErrorData;
};

/**
 * Обрабатывает ответ бэкенда, содержащий ошибку
 *
 * @param response
 * @param parsedResponse
 * @param args
 */
export const processError = (
    response: Response,
    parsedResponse: ErrorData,
    ...args: FetchInput
) => {
    const {status, statusText = 'No response'} = response;
    const [, init] = args;

    const error: ExtendedError = Object.assign(new Error(), {
        data: parsedResponse,
        status,
        statusText,
        httpMethod: (init?.method || 'get') as ExtendedError['httpMethod'],
    });

    return error;
};
