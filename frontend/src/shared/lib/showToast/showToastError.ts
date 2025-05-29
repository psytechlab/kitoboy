import {showToastMessage} from '.';

const defaultErrorMessage =
    'Что-то пошло не так, попробуйте перезагрузить страницу';

/**
 * Показывает toast с переданным текстом или стандартным текстом ошибки и с типом "error"
 *
 * @param message
 */
export const showToastError = (message?: string) =>
    showToastMessage(message || defaultErrorMessage, 'error');
