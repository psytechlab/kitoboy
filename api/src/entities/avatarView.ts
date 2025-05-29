import {PersonId} from './person';
import {StatusId} from './status';
import {PostView} from './postView';
import {AvatarBase} from './avatar';

export type AvatarView = AvatarBase & {
    person: {
        id: PersonId;
        surname: string;
        name: string;
        secondName?: string;
        age?: string;
    };
    status: {
        id: StatusId;
        name: string;
        color: string;
    };
    posts: PostView[];
};
