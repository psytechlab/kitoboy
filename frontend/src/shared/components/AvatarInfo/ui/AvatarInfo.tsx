import {useCallback, useMemo} from 'react';
import {generatePath, useNavigate} from 'react-router-dom';
import cx from 'classnames';
import {Button, Spinner, Text} from '@chakra-ui/react';
import {MdShowChart as ChartIcon} from 'react-icons/md';
import {IoMdList} from 'react-icons/io';

import {Tooltip} from 'src/components/ui/tooltip';
import {AvatarView} from 'src/entities/avatarView';
import {Post} from 'src/entities/post';
import {UserSuicideStatus} from 'src/entities/status';
import {useFullName} from 'src/shared/lib/hooks/useFullName';

import styles from './AvatarInfo.module.css';

export interface AvatarInfoProps {
    avatar: AvatarView;
}

/**
 * Компонент, содержащий краткую информацию об Аватаре и статусе обработки его Постов,
 * а также кнопки навигации на страницы, связанные с Аватаром
 *
 * @param avatar
 */
export const AvatarInfo = ({avatar}: AvatarInfoProps) => {
    // Привлекаем внимание, если атрибуты уже были получены, но статус еще не выставлен
    const needsAttention: boolean = useMemo(() => {
        return (
            avatar.status.id === UserSuicideStatus.NOT_SET &&
            avatar.posts?.every((post: Post) => post.attributes?.length > 0)
        );
    }, [avatar]);

    const fullName: string = useFullName(avatar.person);

    // Если атрибуты каких-то постов еще не выставлены, значит обработка еще не завершена
    const isProcessing: boolean = useMemo(() => {
        return (
            !avatar.posts ||
            avatar.posts.some((post: Post) => post.attributes?.length === 0)
        );
    }, [avatar]);

    const navigate = useNavigate();

    const handlePostsButtonClick = useCallback(() => {
        navigate(generatePath(`/avatar/${avatar.id}`));
    }, [avatar.id]);

    const handleDynamicsButtonClick = useCallback(() => {
        navigate(generatePath(`/dynamics/${avatar.id}`));
    }, [avatar.id]);

    return (
        <div
            className={cx(styles.root, {
                [styles.status_suicide!]:
                    !isProcessing &&
                    avatar.status.id === UserSuicideStatus.SUICIDE,
                [styles.status_antiSuicide!]:
                    !isProcessing &&
                    avatar.status.id === UserSuicideStatus.ANTI_SUICIDE,
                [styles.status_needsAttention!]:
                    !isProcessing && needsAttention,
            })}
        >
            {isProcessing && (
                <Tooltip
                    showArrow
                    content="обработка..."
                    positioning={{placement: 'top'}}
                >
                    <Spinner className={styles.spinner} />
                </Tooltip>
            )}
            <div className={styles.usernameWrapper}>
                <Text
                    className={styles.username}
                    fontSize="lg"
                    fontWeight={500}
                >
                    {avatar.username}
                </Text>
                {fullName && (
                    <Text className={styles.userFio} fontSize="xs">
                        {fullName}
                    </Text>
                )}
            </div>
            <div className={styles.buttonsWrapper}>
                <Button
                    className={styles.button}
                    colorPalette="teal"
                    onClick={handlePostsButtonClick}
                    size="sm"
                    variant="plain"
                >
                    <IoMdList /> Просмотр постов
                </Button>
                <Button
                    className={styles.button}
                    colorPalette="teal"
                    disabled={isProcessing}
                    onClick={handleDynamicsButtonClick}
                    size="sm"
                    variant="plain"
                >
                    <ChartIcon /> Просмотр динамики
                </Button>
            </div>
        </div>
    );
};
