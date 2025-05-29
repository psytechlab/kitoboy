import {Person} from 'src/entities/person';
import {fetchApi} from 'src/shared/lib/fetch';

export type UpdatePersonResponse = Person;

/**
 * Изменяет значения полей Персоны
 *
 * @param personId
 * @param personData
 */
export const updatePerson = async (
    personId: string,
    personData: Omit<Person, 'id'>
) => {
    return fetchApi<UpdatePersonResponse>({
        path: `update-person/${personId}`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
    });
};
