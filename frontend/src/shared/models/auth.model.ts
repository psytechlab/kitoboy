import {createEffect, createEvent, createStore, sample} from 'effector';

import {login as fetchLogin, LoginResponse} from 'src/shared/api/login';
import {API_TOKEN_NAME} from 'src/shared/consts';

export const login = createEvent<{
    username: string;
    password: string;
}>();

export const $isAuthenticated = createStore<boolean>(false);

const loginFx = createEffect(
    async ({
        username,
        password,
    }: {
        username: string;
        password: string;
    }): Promise<LoginResponse> => fetchLogin({username, password})
);

sample({
    clock: login,
    target: loginFx,
});

sample({
    clock: loginFx.doneData,
    fn: result => {
        if (result.token) {
            localStorage.setItem(API_TOKEN_NAME, result.token);
        }

        return true;
    },
    target: $isAuthenticated,
});

sample({
    clock: loginFx.fail,
    fn: () => {
        localStorage.removeItem(API_TOKEN_NAME);
    },
});

/**
 * Модель для работы с авторизацией
 */
export const authModel = {
    stores: {
        $isAuthenticated,
    },
    effects: {
        loginFx,
    },
    events: {
        login,
    },
};
