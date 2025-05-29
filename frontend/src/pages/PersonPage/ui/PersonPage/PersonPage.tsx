import {useCallback} from 'react';
import {useMount} from 'react-use';
import {Text, Theme} from '@chakra-ui/react';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {useUnit} from 'effector-react';

import {AvatarView} from 'src/entities/avatarView';
import {PersonWithAvatarsView} from 'src/entities/personWithAvatarsView';
import {AvatarInfo} from 'src/shared/components/AvatarInfo';
import {Loader} from 'src/shared/components/Loader';
import {StatusBadge} from 'src/shared/components/StatusBadge';
import {formatIntegerWithCaption} from 'src/shared/lib/formatIntegerWithCaption';
import {useFullName} from 'src/shared/lib/hooks/useFullName';

import {PersonInfoForm} from '../PersonInfoForm/PersonInfoForm';
import {personModel} from '../../model';

import styles from './PersonPage.module.css';

/**
 * Компонент страницы Персоны.
 * Содержит информацию о Персоне и ее Статусе, а также список ее Аватаров и краткую информацию о Статусе обработки их Постов
 */
export const PersonPage = () => {
    const {personId} = useParams();
    const {$personWithAvatars: personWithAvatars} = useUnit(personModel.stores);
    const {getPersonWithAvatars} = useUnit(personModel.events);

    const navigate = useNavigate();
    const goBack = useCallback(() => {
        navigate(generatePath('/'));
    }, [navigate]);

    useMount(() => {
        if (!personId) {
            goBack();
            return;
        }

        if (!personWithAvatars) {
            getPersonWithAvatars(personId);
        }
    });

    const fullName: string = useFullName(personWithAvatars);

    if (!personWithAvatars) {
        return <Loader />;
    }

    const {age, status, avatars} = personWithAvatars as PersonWithAvatarsView;

    return (
        <Theme appearance="light">
            <div className={styles.root}>
                <section className={styles.pagesSection}>
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            <Text fontWeight="normal" textStyle="xl">
                                {fullName} •{' '}
                                {age &&
                                    `${formatIntegerWithCaption(age, 'год', 'года', 'лет')}`}
                            </Text>
                            <StatusBadge
                                className={styles.badge}
                                statusId={status.id}
                                personId={personId}
                            />
                        </div>

                        {personId && <PersonInfoForm personId={personId} />}
                    </div>

                    <div className={styles.avatarsWrapper}>
                        {avatars &&
                            avatars.map((avatar: AvatarView, i: number) => (
                                <AvatarInfo key={i} avatar={avatar} />
                            ))}
                    </div>
                </section>
            </div>
        </Theme>
    );
};
