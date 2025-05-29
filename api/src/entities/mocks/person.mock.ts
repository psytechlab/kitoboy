import {PersonBase, Person} from '../person';
import {PersonView} from '../personView';

import {STATUS_MOCK} from './status.mock';

export const PERSON_BASE_MOCK: PersonBase = {
    id: '123',
    surname: 'Пупкин',
    name: 'Василий',
    secondName: 'Иванович',
};

export const PERSON_VIEW_MOCK: PersonView = {
    ...PERSON_BASE_MOCK,
    age: '22',
    address: 'г.Москва, ул.Б.Конюшенная, д. 99, кв.99',
    phone: '+7(999)999-99-99',
    organization: 'ООО "Шарики за Ролики"',
    description: 'некоторая крайне ценная информация',
};

export const PERSON_MOCK: Person = {
    ...PERSON_VIEW_MOCK,
    statusId: STATUS_MOCK.id,
};
