import {fetchApi} from 'src/shared/lib/fetch';

export type CreateAvatarBase = {
    fileFormData: FormData;
    username: string;
};

export type CreateAvatarNewPerson = {
    surname: string;
    name: string;
    secondName?: string;
    age?: string;
    address?: string;
    phone?: string;
    organization?: string;
    description?: string;
};

export type CreateAvatarExistingPerson = {
    id: string;
};

export type CreateAvatarPerson =
    | CreateAvatarNewPerson
    | CreateAvatarExistingPerson;

export type CreateAvatarRequest = CreateAvatarBase & {
    person: CreateAvatarPerson;
};

type CreateAvatarResponse = {
    id: string;
};

/**
 * Создает нового Аватара
 *
 * @param params
 */
export const createAvatar = async (params: FormData) => {
    return fetchApi<CreateAvatarResponse>({
        path: 'create-avatar/',
        body: params,
    });
};
