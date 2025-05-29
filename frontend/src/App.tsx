import {RouterProvider, RouterProviderProps} from 'react-router-dom';

import {Provider} from 'src/components/ui/provider';
import {getRouter} from 'src/router';

import './App.css';

interface AppProps {
    customRouter?: RouterProviderProps['router'];
}

export const App = (props: AppProps) => {
    const {customRouter = getRouter()} = props;

    return (
        <Provider>
            <RouterProvider router={customRouter} />
        </Provider>
    );
};
