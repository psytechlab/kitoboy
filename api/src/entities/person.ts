import {StatusId} from './status';

export type PersonId = string;

export type PersonBase = {
    id: PersonId;
    surname: string;
    name: string;
    secondName?: string;
};

export type Person = PersonBase & {
    age?: string;
    address?: string;
    phone?: string;
    organization?: string;
    description?: string;
    statusId?: StatusId;
};
