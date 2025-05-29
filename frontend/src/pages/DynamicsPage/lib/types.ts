import {Attribute} from 'src/entities/attribute';
import {PostView} from 'src/entities/postView';
import {SelectValue} from 'src/shared/types/selectValue';

export interface CalculateChartValues {
    endDate: Date | null;
    posts: PostView[];
    selectedAttributes: Attribute[];
    selectedRevDutyCycleValue: SelectValue;
    startDate: Date | null;
}

export type Month = {
    name: string;
    id: number;
};

export type ChartDataset = {
    label: string;
    data: number[];
};

export type CalculatedChartData = {
    labels: string[];
    datasets: ChartDataset[];
};

export enum DateItem {
    day = 'day',
    month = 'month',
    year = 'year',
}
