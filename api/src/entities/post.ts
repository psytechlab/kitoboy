import {AvatarId} from './avatar';
import {Attribute} from './attribute';

export type PostId = string;

export type PostBase = {
    id: PostId;
    text: string;
    postedAt: string;
    avatarId: AvatarId;
};

export type Post = PostBase & {
    attributes?: Attribute[];
};
