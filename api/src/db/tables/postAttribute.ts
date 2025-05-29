import {
    Column,
    CreatedAt,
    DataType,
    DeletedAt,
    Model,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';

import {AttributeInstance} from './attribute';
import {PostInstance} from './post';

export interface PostAttributeSchema {
    postId: string;
    attributeId: string;
    createdAt: Date;
    updatedAt: Date;
}

@Table({
    tableName: 'postAttributes',
    modelName: 'postAttribute',
})
export class PostAttributeInstance
    extends Model<PostAttributeInstance>
    implements PostAttributeSchema
{
    @Column(DataType.UUID) readonly postId!: string;
    @Column(DataType.UUID) readonly attributeId!: string;

    @CreatedAt readonly createdAt!: Date;
    @UpdatedAt readonly updatedAt!: Date;

    readonly attribute?: AttributeInstance;
    readonly post?: PostInstance;
}
