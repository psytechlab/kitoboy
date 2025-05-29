import {showToastMessage} from 'src/shared/lib/showToast';

import {DATE_ITEMS_LIMIT} from './consts';
import {DateItem} from './types';

/**
 * Показывает toast о превышении максимально допустимого количества единиц времени
 *
 * @param dateItemType
 */
export const showMaxDateItemsCountToast = (dateItemType: DateItem) => {
    let dateItemString: string;

    switch (dateItemType) {
        case DateItem.day:
            dateItemString = 'дней';

            break;
        case DateItem.month:
            dateItemString = 'месяцев';

            break;
        case DateItem.year:
            dateItemString = 'лет';

            break;
        default:
            dateItemString = 'периодов';
    }

    showToastMessage(
        `Максимальное количество отображаемых ${dateItemString}: ${DATE_ITEMS_LIMIT}. Выберите другую скважность для выбранного периода`,
        'warning'
    );
};
