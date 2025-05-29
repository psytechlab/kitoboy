import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import {addDataToDatasets} from './addDataToDatasets';
import {DATE_ITEMS_LIMIT, MONTHS} from './consts';
import {showMaxDateItemsCountToast} from './showMaxDateItemsCountToast';
import {
    CalculateChartValues,
    CalculatedChartData,
    ChartDataset,
    DateItem,
    Month,
} from './types';

dayjs.locale('ru-ru');

/**
 * Возвращает данные для графика в формате ChartData<"bar", TData, TLabel>.
 *
 * В возвращаемом объекте:
 *  - поле labels содержит массив текстовых подписей для значений на оси Х (единицы времени).
 *  - поле datasets содержит массив объектов данных в формате:
 *      - label - название атрибута.
 *      - data - массив числовых значений по оси Y для этого атрибута, соответствующих каждому значению на оси X.
 * @param endDate
 * @param posts
 * @param selectedAttributes
 * @param selectedRevDutyCycleValue
 * @param startDate
 */
export const calculateChartData = ({
    endDate,
    posts,
    selectedAttributes,
    selectedRevDutyCycleValue,
    startDate,
}: CalculateChartValues): CalculatedChartData => {
    if (
        !startDate ||
        !endDate ||
        !selectedAttributes?.length ||
        !selectedRevDutyCycleValue?.value
    ) {
        return {labels: [], datasets: []};
    }

    const labels: string[] = [];
    const datasets: ChartDataset[] = selectedAttributes.map(attribute => ({
        label: attribute.name,
        data: [],
    }));
    const parsedStartDate = dayjs(startDate);
    const parsedEndDate = dayjs(endDate);
    const startYear = parsedStartDate.year();
    const endYear = parsedEndDate.year();
    const startMonth = parsedStartDate.month();
    const endMonth = parsedEndDate.month();
    const yearsArray =
        startYear === endYear
            ? [startYear]
            : Array(endYear - startYear + 1)
                  .fill(null)
                  .map((_, idx) => startYear + idx);

    switch (selectedRevDutyCycleValue.value) {
        case 'year':
            yearsArray.forEach(year => {
                const yearString = String(year);
                const date = dayjs(yearString);

                labels.push(yearString);

                addDataToDatasets({
                    datasets,
                    date,
                    dateItemType: DateItem.year,
                    posts,
                    selectedAttributes,
                });
            });

            break;
        case 'month':
            if (yearsArray.length === 1) {
                MONTHS.slice(startMonth, endMonth + 1).forEach(mon => {
                    const selectedYearString = String(parsedStartDate.year());
                    const date = dayjs(`${selectedYearString}-${mon.id}`);

                    labels.push(`${mon.name}`);

                    addDataToDatasets({
                        datasets,
                        date,
                        dateItemType: DateItem.month,
                        posts,
                        selectedAttributes,
                    });
                });
            } else {
                yearsArray.forEach(year => {
                    const yearString = String(year);
                    let selectedMonths: Month[];

                    if (year === startYear) {
                        selectedMonths = MONTHS.slice(startMonth);
                    } else if (year !== endYear) {
                        selectedMonths = MONTHS;
                    } else {
                        selectedMonths = MONTHS.slice(0, endMonth + 1);
                    }

                    selectedMonths.forEach(mon => {
                        const date = dayjs(`${yearString}-${mon.id}`);

                        labels.push(`${mon.name} ${year}`);

                        addDataToDatasets({
                            datasets,
                            date,
                            dateItemType: DateItem.month,
                            posts,
                            selectedAttributes,
                        });
                    });
                });
            }

            break;
        case 'day':
            const daysDiff = parsedEndDate.diff(parsedStartDate, 'day');
            const daysLimit = Math.min(daysDiff, DATE_ITEMS_LIMIT);

            if (daysDiff > DATE_ITEMS_LIMIT) {
                showMaxDateItemsCountToast(DateItem.day);
            }

            const format = startYear === endYear ? 'DD/MM' : 'DD/MM/YYYY';

            for (let i = 0; i < daysLimit + 1; i++) {
                const date = parsedStartDate.add(i, 'day');

                labels.push(date.format(format));

                addDataToDatasets({
                    datasets,
                    date,
                    dateItemType: DateItem.day,
                    posts,
                    selectedAttributes,
                });
            }

            break;
    }

    return {labels, datasets};
};
