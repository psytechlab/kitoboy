import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {
    showToastError,
    showToastMessage,
} from '../../../../src/shared/lib/showToast';

describe('showToastError', () => {
    vi.mock('../../../../src/shared/lib/showToast/showToastMessage', {
        spy: true,
    });

    beforeEach(() => {
        vi.mocked(showToastMessage).mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should call showToastMessage with passed message and type "error"', () => {
        showToastError('test');

        expect(showToastMessage).toHaveBeenCalledWith('test', 'error');
    });

    it('should call showToastMessage with default message when message was not passed', () => {
        showToastError();

        expect(showToastMessage).toHaveBeenCalledWith(
            'Что-то пошло не так, попробуйте перезагрузить страницу',
            'error'
        );
    });
});
