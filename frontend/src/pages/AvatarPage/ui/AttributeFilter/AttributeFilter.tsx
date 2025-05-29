import {useMemo} from 'react';
import {Button, ListCollection} from '@chakra-ui/react';
import {MdOutlineFilterAlt} from 'react-icons/md';

import {
    PopoverBody,
    PopoverContent,
    PopoverRoot,
    PopoverTrigger,
} from 'src/components/ui/popover';
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from 'src/components/ui/select';

import styles from './AttributeFilter.module.css';

export type AttributeFilterProps = {
    attributeFilterValues: ListCollection;
    onAttributeFilterChange: (e: any) => void;
};

/**
 * Компонент фильтра Постов Аватара по Атрибутам.
 * Позволяет выбрать несколько Атрибутов из списка.
 *
 * @param attributeFilterValues
 * @param onAttributeFilterChange
 */
export const AttributeFilter = ({
    attributeFilterValues,
    onAttributeFilterChange,
}: AttributeFilterProps) => {
    const isEmpty = useMemo(() => {
        return !attributeFilterValues?.items?.length;
    }, [attributeFilterValues]);

    return (
        <div className={styles.filterButtonContainer}>
            <PopoverRoot size="xs">
                <PopoverTrigger asChild>
                    <Button
                        className={styles.filterButton}
                        colorPalette="teal"
                        disabled={isEmpty}
                        variant="plain"
                        size="xs"
                    >
                        фильтр по атрибутам <MdOutlineFilterAlt />
                    </Button>
                </PopoverTrigger>

                <PopoverContent>
                    <PopoverBody>
                        <SelectRoot
                            collection={attributeFilterValues}
                            multiple
                            onValueChange={onAttributeFilterChange}
                            size="sm"
                            positioning={{
                                sameWidth: true,
                                placement: 'bottom',
                            }}
                        >
                            <SelectTrigger>
                                <SelectValueText placeholder="Выберите атрибуты" />
                            </SelectTrigger>
                            <SelectContent portalled={false} width="full">
                                {attributeFilterValues.items.map(item => (
                                    <SelectItem item={item} key={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </PopoverBody>
                </PopoverContent>
            </PopoverRoot>
        </div>
    );
};
