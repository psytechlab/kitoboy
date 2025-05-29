import {Outlet, ScrollRestoration} from 'react-router-dom';

import {Toaster} from 'src/components/ui/toaster';

/**
 * Компонент корневой страницы для роутинга
 */
export const RootRoutePage = () => {
    return (
        <>
            <ScrollRestoration />
            <Outlet />
            <Toaster />
        </>
    );
};
