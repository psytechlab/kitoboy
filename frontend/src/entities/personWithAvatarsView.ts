import {AvatarView} from './avatarView';
import {PersonView} from './personView';

export type PersonWithAvatarsView = PersonView & {
    avatars: Omit<AvatarView, 'person'>[];
};
