import {AvatarBase, Avatar} from '../avatar';

import {STATUS_MOCK} from './status.mock';
import {PERSON_MOCK} from './person.mock';

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
