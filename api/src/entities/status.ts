export enum SuicideStatus {
    SUICIDE = 'suicide',
    ANTI_SUICIDE = 'anti_suicide',
    NEEDS_ATTENTION = 'needs_attention',
    NOT_SET = 'not_set',
}

export type StatusId = SuicideStatus;

export type Status = {
    id: StatusId;
    name: string;
    color: string;
};
