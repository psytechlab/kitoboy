import {createBrowserRouter, RouteObject} from 'react-router-dom';

import {RootRoutePage} from './pages/RootRoutePage';
import {MainPage} from './pages/MainPage';
import {CreateAvatarPage} from './pages/CreateAvatarPage';
import {AvatarPage} from './pages/AvatarPage';
import {PersonPage} from './pages/PersonPage';
import {DynamicsPage} from './pages/DynamicsPage';
import {LoginPage} from './pages/LoginPage';
import {Header} from './shared/components/Header';
import {NotFound} from './shared/components/NotFound';
import {ROUTER_BASE_NAME} from './shared/consts';

export const routes: RouteObject[] = [
    {
        path: '/',
        Component: RootRoutePage,
        id: 'root',
        children: [
            {
                element: <Header />,
                children: [
                    {
                        path: '/',
                        element: <MainPage />,
                    },
                    {
                        path: '/avatar/:avatarId',
                        Component: AvatarPage,
                    },
                    {
                        path: '/dynamics/:avatarId',
                        Component: DynamicsPage,
                    },
                    {
                        path: `/person/:personId`,
                        Component: PersonPage,
                    },
                    {
                        path: '/create-avatar',
                        Component: CreateAvatarPage,
                    },
                    {
                        path: '/login',
                        Component: LoginPage,
                    },
                ],
            },
            {
                path: '*',
                Component: NotFound,
            },
        ],
    },
];

// чтобы обработчик роутов не создался раньше времени
export const getRouter = () =>
    createBrowserRouter(routes, {basename: ROUTER_BASE_NAME});
