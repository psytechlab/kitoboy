import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import dayjs, {Dayjs, UnitTypeLong} from 'dayjs';

import {Attribute} from '../../../src/entities/attribute';
import {ATTRIBUTE_MOCK} from '../../../src/entities/mocks/attribute.mock';
import {POST_MOCK, POST_MOCK_2} from '../../../src/entities/mocks/post.mock';
import {Post} from '../../../src/entities/post';
import {addDataToDatasets} from '../../../src/pages/DynamicsPage/lib';
import {
    ChartDataset,
    DateItem,
} from '../../../src/pages/DynamicsPage/lib/types';

vi.mock('dayjs');

class DayJsMock {
    _date: Date;

    constructor(date: Date | string) {
        this._date = typeof date === 'string' ? new Date(date) : date;
    }

    getDate = () => {
        return this._date.getDate();
    };

    getMonth = () => {
        return this._date.getMonth();
    };

    getFullYear = () => {
        return this._date.getFullYear();
    };

    isSame = (secondDate: DayJsMock, dateItemType: UnitTypeLong): boolean => {
        switch (dateItemType) {
            case 'day':
                return secondDate.getDate() === this.getDate();
            case 'month':
                return secondDate.getMonth() === this.getMonth();
            case 'year':
                return secondDate.getFullYear() === this.getFullYear();
        }
    };
}

const dayJsMockFn = (dateString: string) => {
    return new DayJsMock(dateString);
};

describe('addDataToDatasets', () => {
    let posts: Post[];
    let selectedAttributes: Attribute[];
    let date: Dayjs;
    let datasets: ChartDataset[];

    beforeEach(() => {
        posts = [POST_MOCK, POST_MOCK_2];
        selectedAttributes = [ATTRIBUTE_MOCK];
        date = new DayJsMock(new Date('2025-01-01')) as unknown as Dayjs;
        datasets = [
            {
                label: ATTRIBUTE_MOCK.name,
                data: [],
            },
        ];

        vi.mocked(dayjs).mockImplementation(dayJsMockFn);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('day', () => {
        addDataToDatasets({
            dateItemType: DateItem.day,
            date,
            datasets,
            posts,
            selectedAttributes,
        });

        expect(datasets.length).toBe(1);
        expect(datasets[0].data).toEqual([1]);
    });

    it('month', () => {
        addDataToDatasets({
            dateItemType: DateItem.month,
            date,
            datasets,
            posts,
            selectedAttributes,
        });

        expect(datasets.length).toBe(1);
        expect(datasets[0].data).toEqual([1]);
    });

    it('year', () => {
        addDataToDatasets({
            dateItemType: DateItem.year,
            date,
            datasets,
            posts,
            selectedAttributes,
        });

        expect(datasets.length).toBe(1);
        expect(datasets[0].data).toEqual([1]);
    });
});
