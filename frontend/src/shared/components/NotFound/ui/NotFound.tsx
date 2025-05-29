import {generatePath} from 'react-router-dom';
import {Link, Text} from '@chakra-ui/react';

import {ROUTER_BASE_NAME} from 'src/shared/consts';

import styles from './NotFound.module.css';
import {useMemo} from 'react';

/**
 * Компонент заглушки для ошибки 404 с кнопкой перехода на главную страницу
 */
export const NotFound = () => {
    const path = useMemo(() => {
        return generatePath(`${ROUTER_BASE_NAME}/`);
    }, []);

    return (
        <div className={styles.root}>
            <div className={styles.wrapper}>
                <Text fontWeight="normal" textStyle="3xl">
                    Страницы не существует
                </Text>
                <Text color="teal.600" fontWeight="bold" textStyle="7xl">
                    404
                </Text>
                <Link href={path} variant="underline">
                    <Text fontWeight="normal" textStyle="3xl">
                        На главную
                    </Text>
                </Link>
            </div>
        </div>
    );
};
