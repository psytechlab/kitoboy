import {useCallback, useMemo, useState} from 'react';
import {MdAdd} from 'react-icons/md';
import {Button, Spinner, Text, Popover, Portal, Theme} from '@chakra-ui/react';
import {useUnit} from 'effector-react';

import {Tag} from 'src/components/ui/tag';
import {Attribute} from 'src/entities/attribute';
import {SearchInput} from 'src/shared/components/SearchInput';
import {SearchInputOption} from 'src/shared/components/SearchInput/ui/SearchInput';
import {avatarModel} from 'src/shared/models/avatar.model';

import styles from './AvatarPost.module.css';

const DATE_OPTIONS = new Intl.DateTimeFormat('ru', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
});

const TIME_OPTIONS = new Intl.DateTimeFormat('ru', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: 'numeric',
});

export type AttributeEventHandler = ({
    attributeId,
    postId,
}: {
    attributeId: string;
    postId: string;
}) => void;

export type AvatarPostProps = {
    postId: string;
    text: string;
    postedAt: string;
    onAddAttribute?: AttributeEventHandler;
    onRemoveAttribute?: AttributeEventHandler;
    attributes?: Attribute[];
};

/**
 * Компонент с данными о Посте Аватара и его Атрибутах.
 * Позволяет добавлять и удалять Атрибуты и просматривать статус обработки Поста
 *
 * @param postId
 * @param text
 * @param postedAt
 * @param attributes
 * @param onAddAttribute
 * @param onRemoveAttribute
 */
export const AvatarPost = ({
    postId,
    text,
    postedAt,
    attributes = [],
    onAddAttribute,
    onRemoveAttribute,
}: AvatarPostProps) => {
    const [selectedAttribute, setSelectedAttribute] =
        useState<SearchInputOption | null>(null);
    const [attributeSearch, setAttributeSearch] = useState<string>('');
    const {$attributeSearchOptions} = useUnit(avatarModel.stores);
    const dateValue = useMemo(() => {
        if (!postedAt) {
            return null;
        }

        const parsedDate = Date.parse(postedAt);

        return !isNaN(parsedDate) ? new Date(parsedDate) : null;
    }, [postedAt]);

    const dateString = useMemo(() => {
        return dateValue
            ? DATE_OPTIONS.format(dateValue) || 'неизвестно'
            : 'неизвестно';
    }, [dateValue]);

    const timeString = useMemo(() => {
        return dateValue ? TIME_OPTIONS.format(dateValue) || '' : '';
    }, [dateValue]);

    const handleSearchAttributeChange = useCallback(
        (_, newValue: SearchInputOption) => {
            setSelectedAttribute(newValue);
        },
        [setSelectedAttribute]
    );

    const handleSearchAttributeInputChange = useCallback(
        (_, newValue: string) => {
            setAttributeSearch(newValue);
        },
        [$attributeSearchOptions, setAttributeSearch]
    );

    const handleAddAttributeClick = useCallback(() => {
        if (selectedAttribute) {
            onAddAttribute?.({postId, attributeId: selectedAttribute.id});
            resetSelectedAttribute();
        }
    }, [onAddAttribute, selectedAttribute]);

    const handleRemoveAttributeClick = useCallback(
        ({attributeId}: {attributeId: string}) => {
            onRemoveAttribute?.({postId, attributeId});
        },
        [onRemoveAttribute]
    );

    const resetSelectedAttribute = useCallback(() => {
        setSelectedAttribute(null);
        setAttributeSearch('');
    }, [setSelectedAttribute]);

    const isProcessingFinished = useMemo(() => {
        return !!attributes?.length;
    }, [attributes]);

    const isAddingAttributesAvailable = useMemo(() => {
        return onAddAttribute !== undefined;
    }, [onAddAttribute]);

    const attributeSearchOptions = useMemo(() => {
        const availableOptions = $attributeSearchOptions.filter(
            (attributeSearchOption: SearchInputOption) => {
                return attributes?.every(
                    (attribute: Attribute) =>
                        attribute.id !== attributeSearchOption.id
                );
            }
        );

        return attributeSearch
            ? availableOptions.filter(
                  (attributeSearchOption: SearchInputOption) => {
                      return attributeSearchOption.label.startsWith(
                          attributeSearch
                      );
                  }
              )
            : availableOptions;
    }, [$attributeSearchOptions, attributes, attributeSearch]);

    return (
        <div className={styles.post} key={postId}>
            <div className={styles.postContentContainer}>
                <Text className={styles.postTimestamp} textStyle="sm">
                    {dateString} {timeString}
                </Text>
                <Text className={styles.postText} textStyle="sm">
                    {text}
                </Text>
            </div>
            <div className={styles.postAttributesContainer}>
                {attributes.map(({id, name, color}) => {
                    return (
                        <Tag
                            className={styles.attribute}
                            closable
                            key={id}
                            maxW="800px"
                            onClose={() =>
                                handleRemoveAttributeClick({attributeId: id})
                            }
                            size="md"
                            style={{backgroundColor: `${color}`}}
                            variant="subtle"
                        >
                            <Text fontWeight="medium">{name}</Text>
                        </Tag>
                    );
                })}

                {isProcessingFinished && isAddingAttributesAvailable && (
                    <Popover.Root
                        onOpenChange={resetSelectedAttribute}
                        size="xs"
                    >
                        <Popover.Trigger asChild>
                            <Tag
                                className={styles.addAttributeButton}
                                size="md"
                                variant="subtle"
                            >
                                <Text fontWeight="medium">
                                    <MdAdd />
                                </Text>
                            </Tag>
                        </Popover.Trigger>
                        <Portal>
                            <Popover.Positioner>
                                <Popover.Content>
                                    <Theme appearance="light">
                                        <Popover.Arrow>
                                            <Popover.ArrowTip />
                                        </Popover.Arrow>

                                        <Popover.Body>
                                            <SearchInput
                                                label="Атрибут"
                                                name="attributeId"
                                                onChange={
                                                    handleSearchAttributeChange
                                                }
                                                onInputChange={
                                                    handleSearchAttributeInputChange
                                                }
                                                options={attributeSearchOptions}
                                                required={true}
                                                showOptionIds={false}
                                                size="xs"
                                                value={selectedAttribute}
                                            />
                                            <Button
                                                className={
                                                    styles.submitAttributeButton
                                                }
                                                colorPalette="teal"
                                                disabled={!selectedAttribute}
                                                onClick={
                                                    handleAddAttributeClick
                                                }
                                                size="xs"
                                                variant="solid"
                                            >
                                                Сохранить
                                            </Button>
                                        </Popover.Body>
                                    </Theme>
                                </Popover.Content>
                            </Popover.Positioner>
                        </Portal>
                    </Popover.Root>
                )}
                {!isProcessingFinished && <Spinner size="xs" />}
            </div>
        </div>
    );
};
