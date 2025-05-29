import {Person} from 'src/entities/person';
import {UserSuicideStatus} from 'src/entities/status';
import {fetchApi} from 'src/shared/lib/fetch';

export type UpdatePersonStatusResponse = Person;

/**
 * Изменяет статус Персоны
 *
 * @param personId
 * @param statusId
 */
export const updatePersonStatus = async ({
    personId,
    statusId,
}: {
    personId: string;
    statusId: UserSuicideStatus;
}) => {
    return fetchApi<UpdatePersonStatusResponse>({
        path: `update-person-status/${personId}`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({statusId}),
    });
};
