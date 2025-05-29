import {useCallback, useEffect, useMemo, useState} from 'react';
import {createListCollection, Flex, Theme} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {useUnit} from 'effector-react';
import {
    Chart as ChartJS,
    CategoryScale,
    Colors,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import {useMount} from 'react-use';

import 'react-datepicker/dist/react-datepicker.css';

import {Attribute} from 'src/entities/attribute';
import {Field} from 'src/components/ui/field';
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from 'src/components/ui/select';
import {Loader} from 'src/shared/components/Loader';
import {useAvatarAttributes} from 'src/shared/lib/hooks/useAvatarAttributes';
import {useFullName} from 'src/shared/lib/hooks/useFullName';
import {avatarModel} from 'src/shared/models/avatar.model';
import {SelectValue} from 'src/shared/types/selectValue';

import {calculateChartData} from '../lib/calculateChartData';

import styles from './DynamicsPage.module.css';

ChartJS.register(
    CategoryScale,
    Colors,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const REV_DUTY_CYCLE_VALUES: SelectValue[] = [
    {
        label: 'Год',
        value: 'year',
    },
    {
        label: 'Месяц',
        value: 'month',
    },
    {
        label: 'День',
        value: 'day',
    },
];

/**
 * Страница отслеживания динамики Атрибутов Аватара во времени
 *
 * При открытии страницы использует route-параметр avatarId для получения данных об Аватаре.
 * Получает данные об аватаре с бэкенда самостоятельно.
 *
 * Содержит базовую информаци об Аватаре и связанной с ним Персоне и график динамики.
 * График позволяет выбрать необходимые Атрибуты, шаг агрегации по времени и временной интервал.
 * При изменении настроек график автоматически перестраивается.
 */
export const DynamicsPage = () => {
    const {avatarId} = useParams();
    const {$avatar: avatar} = useUnit(avatarModel.stores);
    const {getAvatar} = useUnit(avatarModel.events);

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
    });

    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>(
        []
    );
    const [selectedRevDutyCycleValue, setSelectedRevDutyCycleValue] =
        useState<SelectValue>();
    const [chartData, setChartData] = useState<{
        datasets: {label: any; data: number[]}[];
        labels?: string[];
    }>({datasets: []});

    const onChange = (dates: (Date | null)[]) => {
        const [start, end] = dates;

        setStartDate(start);
        setEndDate(end);
    };

    const fullName: string = useFullName(avatar?.person);

    const chartOptions = useMemo(
        () => ({
            plugins: {
                colors: {
                    forceOverride: true,
                },
                title: {
                    display: true,
                    font: {
                        size: 18,
                    },
                    text: `Динамика - ${fullName} (${avatar?.username})`,
                },
            },
            responsive: true,
            interaction: {
                mode: 'index' as const,
                intersect: false,
            },
        }),
        [avatar]
    );

    useEffect(() => {
        const {labels, datasets} = calculateChartData({
            endDate,
            posts: avatar?.posts || [],
            selectedAttributes,
            selectedRevDutyCycleValue,
            startDate,
        });

        setChartData({
            labels,
            datasets,
        });
    }, [endDate, selectedAttributes, selectedRevDutyCycleValue, startDate]);

    const onRevDutyCycleFilterChange = useCallback((event: any) => {
        setSelectedRevDutyCycleValue(
            REV_DUTY_CYCLE_VALUES.find(({value}) => {
                return event?.value?.includes(value);
            })
        );
    }, []);

    const avatarAttributes: Attribute[] = useAvatarAttributes(avatar);

    if (!avatar) {
        return <Loader />;
    }

    const onAttributesFilterChange = (event: any) => {
        setSelectedAttributes(
            avatarAttributes.filter(({id}) => {
                return event?.value?.includes(id);
            })
        );
    };

    const attributesFilterValues = createListCollection({
        items:
            avatarAttributes?.map(({id, name}) => ({
                label: name,
                value: id,
            })) || [],
    });

    const revDutyCycleFilterValues = createListCollection({
        items: REV_DUTY_CYCLE_VALUES,
    });

    return (
        <Theme appearance="light">
            <div className={styles.root}>
                <section className={styles.pagesSection}>
                    <Flex className={styles.controlsWrapper} gap="4">
                        <Field className={styles.formControl}>
                            <SelectRoot
                                collection={attributesFilterValues}
                                multiple
                                onValueChange={onAttributesFilterChange}
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
                                    {attributesFilterValues.items.map(item => (
                                        <SelectItem
                                            item={item}
                                            key={item.value}
                                        >
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </Field>

                        <Field className={styles.formControl}>
                            <SelectRoot
                                collection={revDutyCycleFilterValues}
                                onValueChange={onRevDutyCycleFilterChange}
                                size="sm"
                                positioning={{
                                    sameWidth: true,
                                    placement: 'bottom',
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValueText placeholder="Выберите скважность" />
                                </SelectTrigger>
                                <SelectContent portalled={false} width="full">
                                    {revDutyCycleFilterValues.items.map(
                                        item => (
                                            <SelectItem
                                                item={item}
                                                key={item.value}
                                            >
                                                {item.label}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </SelectRoot>
                        </Field>

                        <Field className={styles.formControl}>
                            <DatePicker
                                className={styles.dateRange}
                                dateFormat="dd/MM/yyyy"
                                endDate={endDate}
                                onChange={onChange}
                                selected={startDate}
                                selectsRange
                                showIcon
                                startDate={startDate}
                                toggleCalendarOnIconClick
                            />
                        </Field>
                    </Flex>
                    <Flex>
                        {chartData?.datasets?.length ? (
                            <Bar
                                className={styles.bar}
                                data={chartData}
                                options={chartOptions}
                            />
                        ) : (
                            <div className={styles.bar}>
                                Выберите атрибуты для отображения
                            </div>
                        )}
                    </Flex>
                </section>
            </div>
        </Theme>
    );
};
