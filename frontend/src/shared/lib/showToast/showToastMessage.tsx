import {toaster} from 'src/components/ui/toaster';

type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Показывает toast с переданным текстом и типом (по умолчанию - "info")
 *
 * @param message
 * @param type
 */
export const showToastMessage = (message: string, type: ToastType = 'info') =>
    toaster.create({
        title: message,
        type,
    });
