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

export interface UserSchema {
    id: string;
    username: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

@Table({
    tableName: 'users',
    modelName: 'user',
})
export class UserInstance extends Model<UserInstance> implements UserSchema {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.TEXT)
    readonly id!: string;
    @Column(DataType.TEXT) readonly username!: string;
    @Column(DataType.TEXT) readonly password!: string;

    @CreatedAt readonly createdAt!: Date;
    @UpdatedAt readonly updatedAt!: Date;
    @DeletedAt readonly deletedAt!: Date | null;
}
