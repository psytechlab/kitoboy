import {Post} from '../post';

import {AVATAR_MOCK} from './avatar.mock';
import {
    ATTRIBUTE_MOCK,
    ATTRIBUTE_MOCK_2,
} from './attribute.mock';

export const POST_MOCK: Post = {
    id: '0222b95c-4239-4c29-ad0d-0cc0669a5e21',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    postedAt: '2024-12-29T14:11:33.922Z',
    avatarId: AVATAR_MOCK.id,
    attributes: [ATTRIBUTE_MOCK],
};

export const POST_MOCK_2: Post = {
    id: '779c3565-29ec-404b-9f02-eeca6e5df0ff',
    text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    postedAt: '2025-01-01T07:12:34.542Z',
    avatarId: AVATAR_MOCK.id,
    attributes: [ATTRIBUTE_MOCK, ATTRIBUTE_MOCK_2],
};
