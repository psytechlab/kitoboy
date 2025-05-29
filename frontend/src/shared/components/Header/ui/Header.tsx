import {useCallback, useMemo} from 'react';
import {generatePath, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {Box, Heading} from '@chakra-ui/react';
import {FaHome} from 'react-icons/fa';

import {Button} from 'src/components/ui/button';
import {ROUTER_BASE_NAME} from 'src/shared/consts';

import styles from './Header.module.css';

/**
 * Компонент главного хедера приложения
 */
export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isMainPage = useMemo(() => {
        return location?.pathname === '/';
    }, [location]);

    const isLoginPage = useMemo(() => {
        return location?.pathname === '/login';
    }, [location]);

    const handleAddAvatarButtonClick = useCallback(() => {
        navigate(generatePath('/create-avatar'));
    }, []);

    return (
        <>
            <Box className={styles.root} w="100%" p={4} color="white">
                <a href={`${ROUTER_BASE_NAME}`}>
                    {!isMainPage && !isLoginPage && (
                        <Heading as="h1" className={styles.title} size="lg">
                            <FaHome /> На главную
                        </Heading>
                    )}
                </a>
                {!isLoginPage && (
                    <Button
                        className={styles.button}
                        colorPalette="teal"
                        variant="solid"
                        onClick={handleAddAvatarButtonClick}
                        size="md"
                    >
                        Добавить страницу
                    </Button>
                )}
            </Box>
            <Outlet />
        </>
    );
};
