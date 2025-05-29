import {useCallback, useMemo} from 'react';
import {useMount} from 'react-use';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {useUnit} from 'effector-react';
import {createListCollection, Theme} from '@chakra-ui/react';

import {AvatarView} from 'src/entities/avatarView';
import {Attribute} from 'src/entities/attribute';
import {PostView} from 'src/entities/postView';
import {Loader} from 'src/shared/components/Loader';
import {useAvatarAttributes} from 'src/shared/lib/hooks/useAvatarAttributes';
import {useFullName} from 'src/shared/lib/hooks/useFullName';
import {avatarModel} from 'src/shared/models/avatar.model';

import {AvatarHeader} from '../AvatarHeader/AvatarHeader';
import {AttributeFilter} from '../AttributeFilter/AttributeFilter';
import {AvatarPost, AttributeEventHandler} from '../AvatarPost/AvatarPost';

import styles from './AvatarPage.module.css';

/**
 * Компонент страницы Аватара.
 * Содержит информацию об Аватаре и его Статусе, Постах и их Атрибутах.
 *
 * Позволяет:
 *  - просматривать и изменять Статус Аватара
 *  - просматривать общий список Атрибутов всех Постов Аватара
 *  - фильтровать Посты Аватара по выбранным Атрибутам
 *  - добавлять и удалять Атрибуты у отдельных Постов
 *  - переходить на страницу Персоны, связанной с Аватаром
 */
export const AvatarPage = () => {
    const {avatarId} = useParams();
    const {$avatar: avatar, $filteredPosts} = useUnit(avatarModel.stores);
    const {
        addAttribute,
        filterPostsByAttributes,
        getAvatar,
        loadAttributes,
        removeAttribute,
    } = useUnit(avatarModel.events);

    const navigate = useNavigate();
    const goBack = useCallback(() => {
        navigate(generatePath('/'));
    }, [navigate]);

    useMount(() => {
        if (!avatarId) {
            goBack();
            return;
        }

        getAvatar(avatarId);
        loadAttributes();
    });

    const fullName: string = useFullName(avatar?.person);

    const onAttributeFilterChange = (e: any) => {
        if (e?.value) {
            filterPostsByAttributes(e?.value);
        }
    };

    const onAddAttribute: AttributeEventHandler = ({
        attributeId,
        postId,
    }: {
        attributeId: string;
        postId: string;
    }) => {
        addAttribute({postId, attributeId});
    };

    const onRemoveAttribute = useCallback<AttributeEventHandler>(
        ({attributeId, postId}: {attributeId: string; postId: string}) => {
            removeAttribute({postId, attributeId});
        },
        [removeAttribute]
    );

    const avatarAttributes: Attribute[] = useAvatarAttributes(avatar);

    if (!avatar) {
        return <Loader />;
    }

    const {username, person, status, url} = avatar as AvatarView;

    const attributeFilterValues = createListCollection({
        items: avatarAttributes.map(({id, name}) => ({
            label: name,
            value: id,
        })),
    });

    return (
        <Theme appearance="light">
            <div className={styles.root}>
                <section className={styles.pagesSection}>
                    <AvatarHeader
                        avatarId={avatarId!}
                        username={username}
                        url={url}
                        personId={person.id}
                        fullName={fullName}
                        age={person.age}
                        statusId={status.id}
                        attributes={avatarAttributes}
                    />

                    <AttributeFilter
                        attributeFilterValues={attributeFilterValues}
                        onAttributeFilterChange={onAttributeFilterChange}
                    />

                    {$filteredPosts &&
                        ($filteredPosts as PostView[]).map(
                            ({
                                id: postId,
                                text,
                                postedAt,
                                attributes: postAttributes,
                            }) => {
                                return (
                                    <AvatarPost
                                        postId={postId}
                                        text={text}
                                        postedAt={postedAt}
                                        attributes={postAttributes}
                                        onAddAttribute={onAddAttribute}
                                        onRemoveAttribute={onRemoveAttribute}
                                    />
                                );
                            }
                        )}
                </section>
            </div>
        </Theme>
    );
};
