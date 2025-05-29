import {PersonId} from './person';
import {StatusId} from './status';

export type AvatarId = string;

export type AvatarBase = {
    id: AvatarId;
    username: string;
    url: string;
};

export type Avatar = AvatarBase & {
    personId: PersonId;
    statusId: StatusId;
};
