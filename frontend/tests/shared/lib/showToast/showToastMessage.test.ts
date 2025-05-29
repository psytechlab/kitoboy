import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {toaster} from '../../../../src/components/ui/toaster';
import {showToastMessage} from '../../../../src/shared/lib/showToast';

describe('showToastMessage', () => {
    let spy: any;

    beforeEach(() => {
        spy = vi.spyOn(toaster, 'create').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should create toast with passed message and type', () => {
        showToastMessage('test', 'success');

        expect(spy).toHaveBeenCalledWith({
            title: 'test',
            type: 'success',
        });
    });

    it('should create toast with default type when type was not passed', () => {
        showToastMessage('test');

        expect(spy).toHaveBeenCalledWith({
            title: 'test',
            type: 'info',
        });
    });
});
