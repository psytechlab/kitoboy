/**
 * Предоставляет нужное склонение существительного в зависимости от числа
 * (см. https://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html?id=l10n/pluralforms)
 *
 * @param integer
 * @param caption1
 * @param caption2
 * @param caption5
 */
export const formatIntegerWithCaption = (
    /** Само число */
    integer: number,
    /** Существительное в именительном падеже в единственном числе */
    caption1: string,
    /** Для двух элементов */
    caption2: string,
    /** Для множества элементов (*5-*0) */
    caption5: string
): string => {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = [caption1, caption2, caption5];
    const caption =
        titles[
            integer % 100 > 4 && integer % 100 < 20
                ? 2
                : cases[integer % 10 < 5 ? integer % 10 : 5]
        ];

    return `${integer} ${caption}`;
};
