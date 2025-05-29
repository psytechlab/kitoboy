import {AvatarView} from '../avatarView';

import {PERSON_MOCK} from './person.mock';
import {STATUS_MOCK} from './status.mock';
import {POST_VIEW_MOCK} from './postView.mock';
import {AVATAR_MOCK} from './avatar.mock';

export const AVATAR_VIEW_MOCK: AvatarView = {
    id: AVATAR_MOCK.id,
    person: PERSON_MOCK,
    username: AVATAR_MOCK.username,
    url: AVATAR_MOCK.url,
    status: STATUS_MOCK,
    posts: [POST_VIEW_MOCK],
};
