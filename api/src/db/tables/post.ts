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

import {AttributeInstance} from './attribute';
import {AvatarInstance} from './avatar';

export interface PostSchema {
    id: string;
    text: string | null;
    postedAt: string | null;
    avatarId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

@Table({
    tableName: 'posts',
    modelName: 'post',
})
export class PostInstance extends Model<PostInstance> implements PostSchema {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    readonly id!: string;
    @Column(DataType.TEXT) readonly text!: string | null;
    @Column(DataType.TEXT) readonly postedAt!: string | null;
    @Column(DataType.UUID) readonly avatarId!: string | null;

    @CreatedAt readonly createdAt!: Date;
    @UpdatedAt readonly updatedAt!: Date;
    @DeletedAt readonly deletedAt!: Date | null;

    readonly avatar?: AvatarInstance;

    readonly attributes?: AttributeInstance[];
}
