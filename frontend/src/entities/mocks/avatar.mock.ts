import {Avatar, AvatarBase} from '../avatar';

import {PERSON_MOCK} from './person.mock';
import {STATUS_MOCK} from './status.mock';

export const AVATAR_BASE_MOCK: AvatarBase = {
    id: '11',
    username: 'kroko_Gen_04',
    url: 'https://someSuspiciousSocialNetwork.com/kroko_Gen_04',
};

export const AVATAR_MOCK: Avatar = {
    ...AVATAR_BASE_MOCK,
    personId: PERSON_MOCK.id,
    statusId: STATUS_MOCK.id,
};
