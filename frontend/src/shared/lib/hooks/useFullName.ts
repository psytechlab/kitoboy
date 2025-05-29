import {useMemo} from 'react';

import {PersonBase} from 'src/entities/person';

/**
 * Хук, собирающий из отдельных полей Персоны строку, содержащую ФИО
 *
 * @param person
 */
export const useFullName = (person?: PersonBase) => {
    return useMemo(() => {
        if (!person) {
            return '';
        }

        const {name, secondName, surname} = person;

        return surname || name ? `${surname} ${name} ${secondName}` : '';
    }, [person]);
};
