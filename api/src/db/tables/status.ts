import {
    Column,
    CreatedAt,
    DataType,
    Default,
    DeletedAt,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';

import {AvatarInstance} from './avatar';
import {PersonInstance} from './person';

export enum SuicideStatus {
    SUICIDE = 'suicide',
    ANTI_SUICIDE = 'anti_suicide',
    NEEDS_ATTENTION = 'needs_attention',
    NOT_SET = 'not_set',
}

export interface StatusSchema {
    id: SuicideStatus;
    name: string;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
}

@Table({
    tableName: 'statuses',
    modelName: 'status',
})
export class StatusInstance
    extends Model<StatusInstance>
    implements StatusSchema
{
    @PrimaryKey
    @Column(DataType.TEXT)
    readonly id!: SuicideStatus;
    @Column(DataType.TEXT) readonly name!: string;
    @Column(DataType.TEXT) readonly color!: string | null;

    @CreatedAt readonly createdAt!: Date;
    @UpdatedAt readonly updatedAt!: Date;
    @DeletedAt readonly deletedAt!: Date | null;

    readonly avatars?: AvatarInstance[];
    readonly persons?: PersonInstance[];
}
