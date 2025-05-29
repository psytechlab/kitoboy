import {Status} from './status';
import {PostView} from './postView';
import {AvatarBase} from './avatar';
import {PersonView} from './personView';

export type AvatarView = AvatarBase & {
    person: PersonView;
    status: Status;
    posts?: PostView[];
};
