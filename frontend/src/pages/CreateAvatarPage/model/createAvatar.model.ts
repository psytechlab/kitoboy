import {createEffect, createEvent, createStore, sample} from 'effector';

import {Person} from 'src/entities/person';
import {createAvatar as fetchCreateAvatar} from 'src/shared/api/createAvatar';
import {searchPerson as fetchSearchPerson} from 'src/shared/api/searchPerson';

import {TabValues} from '../ui/CreateAvatarPage/CreateAvatarPage';

export type CreateAvatarFormData = Record<string, string>;

const submitCreateAvatar = createEvent<CreateAvatarFormData>();

const changeTabValue = createEvent<TabValues | null>();

const selectFile = createEvent<File | null>();

const searchPerson = createEvent<string>('');

const $tabValue = createStore<TabValues | null>(null);

const $selectedFile = createStore<File | null>(null);

const $avatarCreated = createStore<boolean>(false);

const $persons = createStore<Person[]>([]);

const sendCreateAvatarFx = createEffect(
    async ({
        formValue,
        tabValue,
    }: {
        formValue: FormData;
        tabValue: TabValues | null;
    }) => {
        if (tabValue === TabValues.EXISTING) {
            const newPersonParams = [
                'surname',
                'name',
                'secondName',
                'age',
                'address',
                'phone',
                'organization',
                'description',
            ];

            for (let param of newPersonParams) {
                formValue.delete(param);
            }
        } else {
            formValue.delete('personId');
        }

        return await fetchCreateAvatar(formValue);
    }
);

const $sendCreateAvatarPending = sendCreateAvatarFx.pending;
const sendCreateAvatarDone = sendCreateAvatarFx.done;

const searchPersonFx = createEffect(async (searchString: string) => {
    if (!searchString || searchString.length < 3) {
        return {persons: []};
    }

    return await fetchSearchPerson(searchString);
});

$tabValue.on(changeTabValue, (_, value: TabValues | null) => value);

$selectedFile.on(selectFile, (_, value: File | null) => value);

$avatarCreated.on(sendCreateAvatarDone, () => true);

sample({
    clock: submitCreateAvatar,
    source: [$selectedFile, $tabValue],
    // @ts-ignore
    fn: (
        [file, tabValue]: [File | null, TabValues | null],
        formData: CreateAvatarFormData
    ) => {
        const formValue: FormData = new FormData();

        for (let key of Object.keys(formData)) {
            formValue.append(key, formData[key]);
        }

        if (file) {
            formValue.append('file', file);
        }

        return {
            formValue,
            tabValue,
        };
    },
    target: sendCreateAvatarFx,
});

sample({
    clock: searchPerson,
    target: searchPersonFx,
});

sample({
    clock: searchPersonFx.doneData,
    fn: response => response.persons,
    target: $persons,
});

/**
 * Модель данных для обработки создания Аватара и Персоны, загрузки CSV-файла, прикрепления Аватара к Персоне
 */
export const createAvatarModel = {
    events: {
        changeTabValue,
        submitCreateAvatar,
        selectFile,
        searchPerson,
    },
    stores: {
        $avatarCreated,
        $selectedFile,
        $sendCreateAvatarPending,
        $tabValue,
        $persons,
    },
};
