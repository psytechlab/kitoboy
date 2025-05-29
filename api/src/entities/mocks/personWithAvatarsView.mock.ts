import {PersonWithAvatarsView} from '../personWithAvatarsView';

import {PERSON_VIEW_MOCK} from './person.mock';
import {STATUS_MOCK} from './status.mock';
import {AVATAR_BASE_MOCK} from './avatar.mock';
import {POST_VIEW_MOCK} from './postView.mock';

export const PERSON_WITH_AVATARS_VIEW_MOCK: PersonWithAvatarsView = {
    ...PERSON_VIEW_MOCK,
    status: STATUS_MOCK,
    avatars: [
        {
            ...AVATAR_BASE_MOCK,
            status: STATUS_MOCK,
            posts: [POST_VIEW_MOCK],
        },
    ],
};
