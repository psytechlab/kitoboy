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

import {PostInstance} from './post';

export interface AttributeSchema {
    id: string;
    name: string;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
}

@Table({
    tableName: 'attributes',
    modelName: 'attribute',
})
export class AttributeInstance
    extends Model<AttributeInstance>
    implements AttributeSchema
{
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.TEXT)
    readonly id!: string;
    @Column(DataType.TEXT) readonly name!: string;
    @Column(DataType.TEXT) readonly color!: string | null;

    @CreatedAt readonly createdAt!: Date;
    @UpdatedAt readonly updatedAt!: Date;
    @DeletedAt readonly deletedAt!: Date | null;

    readonly posts?: PostInstance[];
}
