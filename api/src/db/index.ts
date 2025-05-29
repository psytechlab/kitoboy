import dotenv from 'dotenv';
import {Repository, Sequelize} from 'sequelize-typescript';

import {PersonInstance} from './tables/person';
import {AttributeInstance} from './tables/attribute';
import {StatusInstance, StatusSchema, SuicideStatus} from './tables/status';
import {PostInstance} from './tables/post';
import {AvatarInstance} from './tables/avatar';
import {PostAttributeInstance} from './tables/postAttribute';
import {UserInstance} from './tables/user';
import bcrypt from 'bcryptjs';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME || '',
    process.env.DB_USER || '',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || '',
        port: Number(process.env.DB_PORT) || undefined,
        dialect: 'postgres',
        repositoryMode: true,
    }
);

export let AttributeRepository: Repository<AttributeInstance>;
export let AvatarRepository: Repository<AvatarInstance>;
export let PersonRepository: Repository<PersonInstance>;
export let PostAttributeRepository: Repository<PostAttributeInstance>;
export let PostRepository: Repository<PostInstance>;
export let StatusRepository: Repository<StatusInstance>;
export let UserRepository: Repository<UserInstance>;

export const initDatabase = async (tries = 100) => {
    try {
        console.log('Попытка подключения к БД');
        await sequelize.authenticate();

        console.log('Соединение с БД было успешно установлено');

        addModels();
        syncStatuses();
    } catch (e: any) {
        if (tries > 0) {
            console.log(
                'Не удалось подключиться к БД, осталось попыток: ' + tries
            );

            await new Promise(() =>
                setTimeout(() => initDatabase(tries - 1), 10000)
            );

            return;
        } else {
            console.log('Невозможно выполнить подключение к БД: ', e?.original);

            return await sequelize.close();
        }
    }
};

const addModels = () => {
    sequelize.addModels([
        AttributeInstance,
        AvatarInstance,
        PersonInstance,
        PostAttributeInstance,
        PostInstance,
        StatusInstance,
        UserInstance,
    ]);

    AttributeRepository = sequelize.getRepository(AttributeInstance);
    AvatarRepository = sequelize.getRepository(AvatarInstance);
    PersonRepository = sequelize.getRepository(PersonInstance);
    PostAttributeRepository = sequelize.getRepository(PostAttributeInstance);
    PostRepository = sequelize.getRepository(PostInstance);
    StatusRepository = sequelize.getRepository(StatusInstance);
    UserRepository = sequelize.getRepository(UserInstance);

    // Person-Avatars
    AvatarRepository.belongsTo(PersonRepository, {
        foreignKey: 'personId',
        targetKey: 'id',
    });
    PersonRepository.hasMany(AvatarRepository, {
        foreignKey: 'personId',
        sourceKey: 'id',
    });

    // Avatar-Posts
    PostRepository.belongsTo(AvatarRepository, {
        foreignKey: 'avatarId',
        targetKey: 'id',
    });
    AvatarRepository.hasMany(PostRepository, {
        foreignKey: 'avatarId',
        sourceKey: 'id',
    });

    // Posts-Attributes
    PostRepository.belongsToMany(AttributeRepository, {
        through: PostAttributeRepository,
    });
    AttributeRepository.belongsToMany(PostRepository, {
        through: PostAttributeRepository,
    });

    // Status-Avatars
    AvatarRepository.belongsTo(StatusRepository, {
        foreignKey: 'statusId',
        targetKey: 'id',
    });
    StatusRepository.hasMany(AvatarRepository, {
        foreignKey: 'statusId',
        sourceKey: 'id',
    });

    // Status-Persons
    PersonRepository.belongsTo(StatusRepository, {
        foreignKey: 'statusId',
        targetKey: 'id',
    });
    StatusRepository.hasMany(PersonRepository, {
        foreignKey: 'statusId',
        sourceKey: 'id',
    });
};

const syncStatuses = () => {
    sequelize
        .sync()
        .then(() => {
            // Найти дефолтные статусы в БД
            return Promise.all([
                StatusRepository.findAll(),
                UserRepository.findOne({where: {username: 'user'}}),
            ]);
        })
        .then(([statuses, user]) => {
            let results = [];

            // Создать дефолтные значения статусов в БД, если ничего не нашли
            if (!statuses || !statuses.length) {
                results.push(
                    // @ts-ignore
                    StatusRepository.bulkCreate([
                        {
                            id: SuicideStatus.SUICIDE,
                            name: 'Опасный',
                            color: '#FFBC42',
                        },
                        {
                            id: SuicideStatus.ANTI_SUICIDE,
                            name: 'Безопасный',
                            color: '#319795',
                        },
                        {
                            id: SuicideStatus.NOT_SET,
                            name: 'Статус не задан',
                            color: '#FFF',
                        },
                    ] as StatusSchema[])
                );
            }

            if (!user && !!process.env.UI_PASSWORD && !!process.env.UI_USER) {
                results.push(
                    bcrypt
                        .hash(process.env.UI_PASSWORD, 10)
                        .then(hashedPassword => {
                            // @ts-ignore
                            return UserRepository.create({
                                username: process.env.UI_USER!,
                                password: hashedPassword,
                            });
                        })
                );
            }

            return Promise.all(results);
        })
        .catch(error => console.error(error));
};

export const initEmptyModels = () => {
    AttributeRepository = {
        create: () => {},
        findAll: () => {},
        findOne: () => {},
    } as Repository<AttributeInstance>;
    AvatarRepository = {
        create: () => {},
        findAndCountAll: () => {},
        findOne: () => {},
        update: ({}, {}) => {},
    } as Repository<AvatarInstance>;
    PersonRepository = {
        create: () => {},
        findAll: () => {},
        findOne: () => {},
        update: ({}, {}) => {},
    } as Repository<PersonInstance>;
    PostAttributeRepository = {
        bulkCreate: ([]) => {},
        create: () => {},
        findOne: () => {},
    } as Repository<PostAttributeInstance>;
    PostRepository = {
        bulkCreate: ([]) => {},
        findOne: () => {},
    } as Repository<PostInstance>;
    StatusRepository = {
        findAll: () => {},
    } as Repository<StatusInstance>;
    UserRepository = {
        create: () => {},
        findOne: () => {},
    } as Repository<UserInstance>;
};
