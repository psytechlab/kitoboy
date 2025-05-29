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

import {StatusInstance} from './status';
import {PersonInstance} from './person';
import {PostInstance} from './post';

export interface AvatarSchema {
    id: string;
    username: string | null;
    url: string | null;
    personId: string | null;
    statusId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

@Table({
    tableName: 'avatars',
    modelName: 'avatar',
})
export class AvatarInstance
    extends Model<AvatarInstance>
    implements AvatarSchema
{
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    readonly id!: string;
    @Column(DataType.TEXT) readonly username!: string | null;
    @Column(DataType.TEXT) readonly url!: string | null;
    @Column(DataType.UUID) readonly personId!: string | null;
    @Column(DataType.TEXT) readonly statusId!: string | null;

    @CreatedAt readonly createdAt!: Date;
    @UpdatedAt readonly updatedAt!: Date;
    @DeletedAt readonly deletedAt!: Date | null;

    readonly person?: PersonInstance;
    readonly status?: StatusInstance;

    readonly posts?: PostInstance[];
}
