import {useCallback, useMemo} from 'react';
import {generatePath, Outlet} from 'react-router-dom';
import {useLifecycles} from 'react-use';
import {useUnit} from 'effector-react';
import {AbsoluteCenter, Link, Text} from '@chakra-ui/react';

import {AvatarView} from 'src/entities/avatar';
import {AvatarInfo} from 'src/shared/components/AvatarInfo';
import {Loader} from 'src/shared/components/Loader';
import {Paginator} from 'src/shared/components/Paginator';
import {ROUTER_BASE_NAME} from 'src/shared/consts';

import {avatarsModel} from '../model';
import {AVATARS_PER_PAGE} from '../model/avatars.model';

import styles from './MainPage.module.css';

/**
 * Компонент главной страницы.
 * Содержит список Аватаров с краткой информацией об их Статусе и обработке их Постов,
 * а также элементы пагинации по этому списку.
 */
export const MainPage = () => {
    const {$avatars, $paginationData} = useUnit(avatarsModel.stores);
    const {downloadAvatars, downloadAvatarsPage} = useUnit(avatarsModel.events);
    let intervalId: ReturnType<typeof setInterval> = 0;

    useLifecycles(
        () => {
            downloadAvatars();

            intervalId = setInterval(downloadAvatars, 10000);
        },
        () => clearInterval(intervalId)
    );

    const count = useMemo(() => {
        return ($paginationData?.pages || 1) * AVATARS_PER_PAGE;
    }, [$paginationData]);

    const onPageChange = useCallback(({page}: {page: number}) => {
        clearInterval(intervalId);
        downloadAvatarsPage(page);

        intervalId = setInterval(downloadAvatars, 10000);
    }, []);

    const createAvatarPagePath = useMemo(() => {
        return generatePath(`${ROUTER_BASE_NAME}/create-avatar`);
    }, []);

    if (!$avatars) {
        return (
            <AbsoluteCenter p="4" axis="both">
                <Loader />
            </AbsoluteCenter>
        );
    }

    return (
        <>
            <Outlet />
            <section className={styles.pagesSection}>
                {$paginationData && (
                    <Paginator
                        className={styles.paginator}
                        count={count}
                        onPageChange={onPageChange}
                        page={$paginationData?.page}
                        pageSize={AVATARS_PER_PAGE}
                    />
                )}
                {$avatars?.map((avatar: AvatarView, i: number) => (
                    <AvatarInfo key={i} avatar={avatar} />
                ))}
                {$avatars && !$avatars?.length && (
                    <AbsoluteCenter p="4" axis="both">
                        <div className={styles.emptyState}>
                            <Text
                                color="gray.400"
                                fontWeight="bold"
                                textStyle="3xl"
                            >
                                Записи не найдены
                            </Text>
                            <Link
                                href={createAvatarPagePath}
                                variant="underline"
                            >
                                <Text
                                    color="teal.600"
                                    fontWeight="normal"
                                    textStyle="md"
                                >
                                    Добавить страницу пользователя
                                </Text>
                            </Link>
                        </div>
                    </AbsoluteCenter>
                )}
            </section>
        </>
    );
};
