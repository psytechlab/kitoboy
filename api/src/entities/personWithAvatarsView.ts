import {AvatarView} from './avatarView';
import {PersonView} from './personView';
import {Status} from './status';

export type PersonWithAvatarsView = PersonView & {
    status?: Status;
    avatars: Omit<AvatarView, 'person'>[];
};
