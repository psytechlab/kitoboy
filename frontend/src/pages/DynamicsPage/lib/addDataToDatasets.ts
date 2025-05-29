import dayjs, {Dayjs, UnitTypeLong} from 'dayjs';
import 'dayjs/locale/ru';

import {PostView} from 'src/entities/postView';
import {Attribute} from 'src/entities/attribute';

import {ChartDataset, DateItem} from './types';

dayjs.locale('ru-ru');

/**
 * Добавляет в полученные датасеты данные для графика на основе информации из posts для даты из поля date.
 *
 * Мутирует полученный массив datasets, новый не создает.
 *  - поле datasets содержит массив объектов данных в формате:
 *      - label - название атрибута.
 *      - data - массив числовых значений по оси Y для этого атрибута, соответствующих каждому значению на оси X.
 * @param dateItemType
 * @param date
 * @param datasets
 * @param posts
 * @param selectedAttributes
 */
export const addDataToDatasets = ({
    dateItemType,
    date,
    datasets,
    posts,
    selectedAttributes,
}: {
    dateItemType: DateItem;
    date: Dayjs;
    datasets: ChartDataset[];
    posts: PostView[];
    selectedAttributes: Attribute[];
}) => {
    datasets.forEach(dataset => {
        const attributeId = selectedAttributes.find(
            attribute => attribute.name === dataset.label
        )?.id;

        let attributePerDateCounter: number = posts.reduce(
            (count: number, post: PostView) => {
                const isPostedAtDate = date.isSame(
                    dayjs(post?.postedAt),
                    dateItemType as UnitTypeLong
                );
                const hasAttribute = post?.attributes?.some(
                    (postAttribute: Attribute) =>
                        postAttribute?.id === attributeId
                );

                if (isPostedAtDate && hasAttribute) {
                    count++;
                }

                return count;
            },
            0
        );

        dataset.data.push(attributePerDateCounter);
    });
};
