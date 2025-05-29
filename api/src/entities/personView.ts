import {Person} from './person';

export type PersonView = Omit<Person, 'statusId'>;
