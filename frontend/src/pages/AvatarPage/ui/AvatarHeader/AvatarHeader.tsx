import {Collapsible, Link, Text} from '@chakra-ui/react';
import {MdArrowDropDown, MdArrowDropUp, MdLink} from 'react-icons/md';
import {useCallback, useState} from 'react';

import {Tag} from 'src/components/ui/tag';
import {Attribute} from 'src/entities/attribute';
import {UserSuicideStatus} from 'src/entities/status';
import {StatusBadge} from 'src/shared/components/StatusBadge';
import {ROUTER_BASE_NAME} from 'src/shared/consts';
import {formatIntegerWithCaption} from 'src/shared/lib/formatIntegerWithCaption';

import styles from './AvatarHeader.module.css';

export type AvatarHeaderProps = {
    avatarId: string;
    username: string;
    url: string;
    personId: string;
    fullName?: string;
    age?: number;
    statusId?: UserSuicideStatus;
    attributes?: Attribute[];
};

/**
 * Компонент хедера страницы Аватара.
 * Содержит данные об Аватаре и связанной с ним Персоне, а также общий список Атрибутов всех Постов
 *
 * @param avatarId
 * @param username
 * @param url
 * @param personId
 * @param fullName
 * @param age
 * @param statusId
 * @param attributes
 */
export const AvatarHeader = ({
    avatarId,
    username,
    url,
    personId,
    fullName,
    age,
    statusId,
    attributes,
}: AvatarHeaderProps) => {
    const [attributesExpanded, setAttributesExpanded] = useState(false);

    const onAttributesExpandedChange = useCallback((e: any) => {
        setAttributesExpanded(e.open);
    }, []);

    return (
        <div className={styles.header}>
            <div className={styles.headerTitle}>
                <Text
                    className={styles.loginWrapper}
                    fontWeight="bold"
                    textStyle="xl"
                >
                    {username}
                    {url && (
                        <Link
                            className={styles.loginLink}
                            colorPalette="teal"
                            href={url}
                            target="_blank"
                        >
                            <MdLink />
                        </Link>
                    )}
                </Text>
                <Link
                    href={`${ROUTER_BASE_NAME}/person/${personId}`}
                    variant="underline"
                >
                    <Text fontWeight="normal" textStyle="xl">
                        {fullName} •{' '}
                        {age &&
                            `${formatIntegerWithCaption(age, 'год', 'года', 'лет')}`}
                    </Text>
                </Link>

                <StatusBadge statusId={statusId} avatarId={avatarId} />
            </div>

            {!!attributes?.length && (
                <Collapsible.Root
                    className={styles.pageAttributesContainer}
                    onOpenChange={onAttributesExpandedChange}
                >
                    <Collapsible.Trigger
                        className={styles.pageAttributesButton}
                        paddingY="3"
                    >
                        <Text textStyle="xs">все атрибуты на странице </Text>
                        {attributesExpanded ? (
                            <MdArrowDropUp />
                        ) : (
                            <MdArrowDropDown />
                        )}
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                        <div className={styles.attributesContainer}>
                            {attributes &&
                                attributes.map(({id, name, color}) => {
                                    return (
                                        <Tag
                                            className={styles.attribute}
                                            key={id}
                                            maxW="800px"
                                            size="md"
                                            style={{
                                                backgroundColor: `${color}`,
                                            }}
                                            variant="subtle"
                                        >
                                            <Text fontWeight="medium">
                                                {name}
                                            </Text>
                                        </Tag>
                                    );
                                })}
                        </div>
                    </Collapsible.Content>
                </Collapsible.Root>
            )}
        </div>
    );
};
