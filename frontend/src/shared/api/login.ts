import {fetchApi} from 'src/shared/lib/fetch';

export type LoginResponse = {
    message: string;
    token: string;
};

/**
 * Авторизует пользователя по логину и паролю
 *
 * @param username
 * @param password
 */
export const login = async ({
    username,
    password,
}: {
    username: string;
    password: string;
}) => {
    return fetchApi({
        path: `login`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password}),
    });
};
