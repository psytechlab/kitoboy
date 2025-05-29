import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import dayjs from 'dayjs';

import {Attribute} from '../../../src/entities/attribute';
import {ATTRIBUTE_MOCK} from '../../../src/entities/mocks/attribute.mock';
import {POST_MOCK, POST_MOCK_2} from '../../../src/entities/mocks/post.mock';
import {Post} from '../../../src/entities/post';
import {
    addDataToDatasets,
    calculateChartData,
    showMaxDateItemsCountToast,
} from '../../../src/pages/DynamicsPage/lib';
import {DateItem} from '../../../src/pages/DynamicsPage/lib/types';
import {SelectValue} from '../../../src/shared/types/selectValue';

vi.mock('dayjs');
vi.mock('../../../src/pages/DynamicsPage/lib/addDataToDatasets');
vi.mock('../../../src/pages/DynamicsPage/lib/showMaxDateItemsCountToast');

const dayJsMockImpl = (date: Date) => ({
    year: () => {
        return date.getFullYear();
    },
    month: () => {
        return date.getMonth();
    },
    diff: (secondDate: Date, scale: DateItem) => {
        return scale === DateItem.day ? 5 : 1;
    },
    getDate: () => {
        return date.getDate();
    },
    format: (form: string) => {
        return `${date.getDate()}/${date.getMonth() + 1}${form.endsWith('YYYY') ? `/${date.getFullYear()}` : ''}`;
    },
    add: (count: number, scale: DateItem) => {
        const newDate = new Date(date);

        switch (scale) {
            case DateItem.day:
                newDate.setDate(newDate.getDate() + count);

                break;
            case DateItem.month:
                newDate.setMonth(newDate.getMonth() + count);

                break;
            case DateItem.year:
                newDate.setFullYear(newDate.getFullYear() + count);

                break;
        }

        return dayJsMockImpl(newDate);
    },
});

describe('calculateChartData', () => {
    let selectedRevDutyCycleValue: SelectValue;
    let posts: Post[];
    let selectedAttributes: Attribute[];
    let startDate: Date;
    let endDate: Date;

    beforeEach(() => {
        posts = [POST_MOCK, POST_MOCK_2];
        selectedAttributes = [ATTRIBUTE_MOCK];
        startDate = new Date('2024-12-28');
        endDate = new Date('2025-01-02');

        vi.mocked(dayjs).mockImplementation(dayJsMockImpl);
        vi.mocked(addDataToDatasets).mockImplementation(() => {});
        vi.mocked(showMaxDateItemsCountToast).mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('day', () => {
        selectedRevDutyCycleValue = {
            label: 'День',
            value: 'day',
        };

        const result = calculateChartData({
            endDate,
            posts,
            selectedAttributes,
            selectedRevDutyCycleValue,
            startDate,
        });

        expect(result.labels.length).toBe(6);
        expect(result.labels).toStrictEqual([
            '28/12/2024',
            '29/12/2024',
            '30/12/2024',
            '31/12/2024',
            '1/1/2025',
            '2/1/2025',
        ]);
        expect(result.datasets).toStrictEqual([
            {label: ATTRIBUTE_MOCK.name, data: []},
        ]);
    });

    it('month', () => {
        selectedRevDutyCycleValue = {
            label: 'Месяц',
            value: 'month',
        };

        const result = calculateChartData({
            endDate,
            posts,
            selectedAttributes,
            selectedRevDutyCycleValue,
            startDate,
        });

        expect(result.labels.length).toBe(2);
        expect(result.labels).toStrictEqual(['Декабрь 2024', 'Январь 2025']);
        expect(result.datasets).toStrictEqual([
            {label: ATTRIBUTE_MOCK.name, data: []},
        ]);
    });

    it('year', () => {
        selectedRevDutyCycleValue = {
            label: 'Год',
            value: 'year',
        };

        const result = calculateChartData({
            endDate,
            posts,
            selectedAttributes,
            selectedRevDutyCycleValue,
            startDate,
        });

        expect(result.labels.length).toBe(2);
        expect(result.labels).toStrictEqual(['2024', '2025']);
        expect(result.datasets).toStrictEqual([
            {label: ATTRIBUTE_MOCK.name, data: []},
        ]);
    });
});
