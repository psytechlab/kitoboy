import {Person} from './person';
import {Status} from './status';

export type PersonView = Omit<Person, 'statusId'> & {
    status: Status;
};
