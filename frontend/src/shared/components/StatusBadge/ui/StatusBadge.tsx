import {useEffect, useMemo} from 'react';
import {
    Badge,
    createListCollection,
    ListCollection,
    Popover,
    Portal,
    Theme,
} from '@chakra-ui/react';
import {useUnit} from 'effector-react';
import {useMount} from 'react-use';
import cx from 'classnames';

import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from 'src/components/ui/select';
import {Status, UserSuicideStatus} from 'src/entities/status';
import {useStatusBadgeColor} from 'src/shared/lib/hooks/useStatusBadgeColor';
import {statusModel} from 'src/shared/models/status.model';

import styles from './StatusBadge.module.css';

type BaseProps = {
    statusId?: UserSuicideStatus;
    className?: string;
};

type AvatarStatusProps = BaseProps & {
    avatarId: string;
};

type PersonStatusProps = BaseProps & {
    personId: string;
};

type Props = AvatarStatusProps | PersonStatusProps;

const isAvatarStatus = (props: Props): props is AvatarStatusProps =>
    (props as AvatarStatusProps).avatarId !== undefined;

/**
 * Компонент бэйджа Статуса Аватара или Персоны.
 * Содержит логику загрузки Статусов и их изменения через select
 * @param props
 */
export const StatusBadge = (props: Props) => {
    const {$statuses, $statusChanged} = useUnit(statusModel.stores);
    const {downloadStatuses, setAvatarStatus, setPersonStatus} = useUnit(
        statusModel.events
    );

    useMount(() => {
        downloadStatuses();
    });

    useEffect(() => {
        if ($statusChanged) {
            window.location.reload();
        }
    }, [$statusChanged]);

    const statusBadgeColor = useStatusBadgeColor(props.statusId);

    const statusBadgeText = useMemo(() => {
        return (
            $statuses?.find((status: Status) => status.id === props.statusId)
                ?.name || 'Недоступно'
        );
    }, [$statuses, props.statusId]);

    const onStatusChange = (e: any) => {
        if (e?.value?.length) {
            const newStatusId = e!.value[0];
            if (isAvatarStatus(props)) {
                setAvatarStatus({
                    avatarId: props.avatarId,
                    statusId: newStatusId,
                });
            } else {
                setPersonStatus({
                    personId: props.personId,
                    statusId: newStatusId,
                });
            }
        }
    };

    const statusSelectValues: ListCollection = createListCollection({
        items: $statuses.map(({id, name, color}: Status) => ({
            label: name,
            value: id,
            color,
        })),
    });

    return (
        <Popover.Root size="xs">
            <Popover.Trigger asChild>
                <Badge
                    className={cx(styles.badge, props.className)}
                    colorPalette={statusBadgeColor}
                    size="xs"
                    variant="solid"
                >
                    {statusBadgeText}
                </Badge>
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    <Popover.Content>
                        <Theme appearance="light">
                            <Popover.Arrow>
                                <Popover.ArrowTip />
                            </Popover.Arrow>

                            <Popover.Body>
                                <SelectRoot
                                    collection={statusSelectValues}
                                    onValueChange={onStatusChange}
                                    size="sm"
                                    positioning={{
                                        sameWidth: true,
                                        placement: 'bottom',
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValueText placeholder="Выберите статус" />
                                    </SelectTrigger>
                                    <SelectContent
                                        portalled={false}
                                        width="full"
                                    >
                                        {statusSelectValues.items.map(item => (
                                            <SelectItem
                                                item={item}
                                                key={item.value}
                                            >
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectRoot>
                            </Popover.Body>
                        </Theme>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );
};
