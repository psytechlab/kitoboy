import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {showMaxDateItemsCountToast} from '../../../src/pages/DynamicsPage/lib';
import {DateItem} from '../../../src/pages/DynamicsPage/lib/types';
import {showToastMessage} from '../../../src/shared/lib/showToast';

vi.mock('../../../src/shared/lib/showToast/showToastMessage');
vi.mock('dayjs');

describe('showMaxDateItemsCountToast', () => {
    let showToastMessageMock: any;

    beforeEach(() => {
        showToastMessageMock = vi
            .mocked(showToastMessage)
            .mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('day', () => {
        showMaxDateItemsCountToast(DateItem.day);

        expect(showToastMessageMock).toHaveBeenCalledWith(
            `Максимальное количество отображаемых дней: 90. Выберите другую скважность для выбранного периода`,
            'warning'
        );
    });

    it('month', () => {
        showMaxDateItemsCountToast(DateItem.month);

        expect(showToastMessageMock).toHaveBeenCalledWith(
            `Максимальное количество отображаемых месяцев: 90. Выберите другую скважность для выбранного периода`,
            'warning'
        );
    });

    it('year', () => {
        showMaxDateItemsCountToast(DateItem.year);

        expect(showToastMessageMock).toHaveBeenCalledWith(
            `Максимальное количество отображаемых лет: 90. Выберите другую скважность для выбранного периода`,
            'warning'
        );
    });
});
