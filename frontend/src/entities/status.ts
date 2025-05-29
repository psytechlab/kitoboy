export enum UserSuicideStatus {
    SUICIDE = 'suicide',
    ANTI_SUICIDE = 'anti_suicide',
    NOT_SET = 'not_set',
}

export type StatusId = UserSuicideStatus;

export type Status = {
    id: StatusId;
    name: string;
    color: string;
};
