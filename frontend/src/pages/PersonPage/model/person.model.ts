import {createEffect, createEvent, createStore, sample} from 'effector';

import {Person} from 'src/entities/person';
import {PersonWithAvatarsView} from 'src/entities/personWithAvatarsView';
import {getPersonWithAvatarsByPersonId} from 'src/shared/api';
import {updatePerson as fetchUpdatePerson} from 'src/shared/api/updatePerson';

export const $personWithAvatars = createStore<PersonWithAvatarsView | null>(
    null
);

export const $personChangeSubmitted = createStore<boolean>(false);

export const getPersonWithAvatars = createEvent<string>();

export const submitPersonChange = createEvent<Person>();

export const getPersonWithAvatarsFx = createEffect(
    getPersonWithAvatarsByPersonId
);

export const submitPersonChangeFx = createEffect(
    async ({id, ...personData}: Person) => {
        return await fetchUpdatePerson(id, {...personData});
    }
);

const $submitPersonChangePending = submitPersonChangeFx.pending;

const submitPersonChangeDone = submitPersonChangeFx.done;

$personChangeSubmitted.on(submitPersonChangeDone, () => true);

sample({
    clock: getPersonWithAvatars,
    target: getPersonWithAvatarsFx,
});

sample({
    clock: getPersonWithAvatarsFx.doneData,
    target: $personWithAvatars,
});

sample({
    clock: submitPersonChange,
    target: submitPersonChangeFx,
});

/**
 * Модель для хранения и изменения данных о Персоне и ее Аватарах (кроме Статуса)
 */
export const personModel = {
    stores: {
        $personWithAvatars,
        $personChangeSubmitted,
        $submitPersonChangePending,
    },
    events: {
        getPersonWithAvatars,
        submitPersonChange,
    },
};
