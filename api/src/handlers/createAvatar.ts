import {Request, Response} from 'express';

import {Avatar} from '../entities/avatar';
import {CommonError} from '../entities/commonError';
import {Person} from '../entities/person';
import {AvatarRepository, PersonRepository, PostRepository} from '../db';
import {AvatarSchema} from '../db/tables/avatar';
import {PersonSchema} from '../db/tables/person';
import {PostSchema} from '../db/tables/post';
import {SuicideStatus} from '../db/tables/status';
import {parseAvatarCsv} from '../shared/utils';
import {predictOnBatch, PredictOnBatchBody} from '../shared/api/predictOnBatch';

export type CreateAvatarBase = {
    file: Blob;
    username: string;
    url: string;
};

export type CreateAvatarNewPerson = Omit<Person, 'id' | 'statusId'>;

export type CreateAvatarExistingPerson = Pick<Avatar, 'personId'>;

export type CreateAvatarPerson =
    | CreateAvatarNewPerson
    | CreateAvatarExistingPerson;

export type CreateAvatarRequest = CreateAvatarBase & CreateAvatarPerson;

export type CreateAvatarResponse = {
    id: string;
};

const newPersonParams = [
    'surname',
    'name',
    'secondName',
    'age',
    'address',
    'phone',
    'organization',
    'description',
];

const newAvatarParams = ['username', 'url'];

const handleFileError = (res: Response) => {
    res.status(400).send({error: {message: 'IncorrectFile'}});

    return;
};

const checkIsExistingPerson = (
    person: CreateAvatarPerson
): person is CreateAvatarExistingPerson => {
    return (person as CreateAvatarExistingPerson).personId !== undefined;
};

/**
 * Создает аватара с постами на основе CSV-файла и отправляет посты в сервис Zoo
 *
 * При некорректных данных возвращает 400.
 * При передаче поля personId привязывает созданного аватара к персоне с переданным id.
 * При отсутствии поля personId обязательно наличие остальных полей с данными о новой персоне: в этом случае она создается в БД.
 * Создает аватара в БД на основе данных из body и связывает его с созданным или переданным personId.
 * Создает посты в БД на основе распаршенного с помощью parseAvatarCsv файла и связывает их с id созданного аватара.
 * Отправляет созданные посты в сервис Zoo с помощью predictOnBatch для получения предсказаний.
 * В случае получения ошибки от zoo аватар и посты остаются созданными в БД, но возвращает 400 с текстом ошибки.
 * В случае успеха возвращает id созданного аватара со статусом 201.
 * @param {Request<CreateAvatarRequest>} req
 * @param {Response<CreateAvatarResponse | CommonError>} res
 */
export const createAvatarHandler = async (
    req: Request<CreateAvatarRequest>,
    res: Response<CreateAvatarResponse | CommonError>
) => {
    try {
        const file = req.file;
        const body = req.body;

        if (!file) {
            return handleFileError(res);
        }

        const parsedPosts = await parseAvatarCsv(file.path);

        if (!parsedPosts) {
            return handleFileError(res);
        }

        const isExistingPerson = checkIsExistingPerson(body);

        let personId;

        if (isExistingPerson) {
            personId = body.personId;
        } else {
            const createPersonParams: any = {};

            for (let param of newPersonParams) {
                const bodyParam = body[param];

                if (bodyParam) {
                    createPersonParams[param] = bodyParam;
                }
            }

            // @ts-ignore
            const createdPerson = await PersonRepository.create({
                ...createPersonParams,
                statusId: SuicideStatus.NOT_SET,
            } as PersonSchema);

            if (!createdPerson) {
                res.status(400).json({
                    error: 'Incorrect person params',
                });

                return;
            } else {
                personId = createdPerson.id;
            }
        }

        const createAvatarParams: any = {};

        for (let param of newAvatarParams) {
            const bodyParam = body[param];

            if (bodyParam) {
                createAvatarParams[param] = bodyParam;
            }
        }

        // @ts-ignore
        const createdAvatar = await AvatarRepository.create({
            ...createAvatarParams,
            personId,
            statusId: SuicideStatus.NOT_SET,
        } as AvatarSchema);

        if (!createdAvatar) {
            res.status(400).json({
                error: 'Incorrect avatar params',
            });

            return;
        }

        const createPostsParams = parsedPosts.map(
            ({text, postedAt}) =>
                ({
                    avatarId: createdAvatar.id,
                    postedAt,
                    text,
                }) as PostSchema
        );

        const createdPosts = await PostRepository.bulkCreate(
            // @ts-ignore
            createPostsParams
        );

        if (!createdPosts) {
            res.status(400).json({
                error: 'Incorrect posts params',
            });

            return;
        }

        const postsToPredict: PredictOnBatchBody = {
            texts: createdPosts.map(post => ({
                text_id: post.id,
                text: post.text || '',
            })),
        };

        try {
            await predictOnBatch(postsToPredict);
        } catch (err: any) {
            res.status(400).json({
                error: 'Error while sending posts to prediction, but avatar has been successfully created',
            });

            return;
        }

        res.status(201).send({id: createdAvatar.id});
    } catch (err: any) {
        console.error('Error while creating avatar', err);

        res.status(500).json({
            error: 'Error while creating avatar',
        });
    }
};
