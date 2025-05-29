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
import {AvatarInstance} from './avatar';

export interface PersonSchema {
    id: string;
    surname: string;
    name: string;
    secondName: string | null;
    age: string | null;
    address: string | null;
    phone: string | null;
    organization: string | null;
    description: string | null;
    statusId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

@Table({
    tableName: 'persons',
    modelName: 'person',
})
export class PersonInstance
    extends Model<PersonInstance>
    implements PersonSchema
{
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    readonly id!: string;
    @Column(DataType.TEXT) readonly surname!: string;
    @Column(DataType.TEXT) readonly name!: string;
    @Column(DataType.TEXT) readonly secondName!: string;
    @Column(DataType.TEXT) readonly age!: string;
    @Column(DataType.TEXT) readonly address!: string;
    @Column(DataType.TEXT) readonly phone!: string;
    @Column(DataType.TEXT) readonly organization!: string;
    @Column(DataType.TEXT) readonly description!: string;
    @Column(DataType.TEXT) readonly statusId!: string | null;

    @CreatedAt readonly createdAt!: Date;
    @UpdatedAt readonly updatedAt!: Date;
    @DeletedAt readonly deletedAt!: Date | null;

    readonly status?: StatusInstance;

    readonly avatars?: AvatarInstance[];
}
