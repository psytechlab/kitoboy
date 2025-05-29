import {ErrorData, FetchInput} from './types';
import {processError, processResponse} from './requests';

/**
 * Обработчик отправки запроса к бэкенду.
 * Маршрутизирует ответ между успешным и ошибочным обработчиками
 *
 * @param args
 */
export async function fetchKitoboy<T>(...args: FetchInput) {
    const response = await fetch(...args);

    const parsedResponse = await processResponse<T>(response);

    if (response.ok) {
        return parsedResponse as T;
    }

    throw processError(response, parsedResponse as ErrorData, ...args);
}
