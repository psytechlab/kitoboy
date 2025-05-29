import {Post} from './post';

export type PostView = Omit<Post, 'avatarId'>;
