import {SyntheticEvent, useCallback, useEffect, useState} from 'react';
import {Flex, Input, Tabs, Text, Textarea, Theme} from '@chakra-ui/react';
import {ValueChangeDetails} from '@chakra-ui/react/dist/types/components/tabs/namespace';
import {useUnit} from 'effector-react';
import {generatePath, useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {HiUpload} from 'react-icons/hi';

import {Field} from 'src/components/ui/field';
import {
    FileUploadList,
    FileUploadRoot,
    FileUploadTrigger,
} from 'src/components/ui/file-upload';
import {Button} from 'src/components/ui/button';
import {SearchInput} from 'src/shared/components/SearchInput';
import {SearchInputOption} from 'src/shared/components/SearchInput/ui/SearchInput';

import {createAvatarModel} from '../../model/createAvatar.model';

import styles from './CreateAvatarPage.module.css';

export enum TabValues {
    NEW = 'new',
    EXISTING = 'existing',
}

const tabs = [
    {
        value: TabValues.NEW,
        title: 'Новый',
        description: 'Пользователь добавляется впервые',
    },
    {
        value: TabValues.EXISTING,
        title: 'Существущий',
        description: 'Другие страницы пользователя уже есть в системе',
    },
];

export type FormValues = {
    username: string;
    url: string;
    // Все следующие поля нужны только когда создаем новую персону
    surname: string;
    name: string;
    secondName: string;
    address: string;
    age: string;
    phone: string;
    organization: string;
    description: string;
};

/**
 * Страница создания нового Аватара.
 * - содержит форму для ввода данных об Аватаре и Персоне и для загрузки CSV-файла, а также обработку ошибок.
 * - позволяет прикрепить Аватара либо к новой Персоне (и сразу же создать ее),
 *   либо к одной из имеющихся в системе ( используя текстовый поиск).
 */
export const CreateAvatarPage = () => {
    const {
        register,
        handleSubmit,
        formState: {errors, isValid},
    } = useForm<FormValues>();
    const [selectedPerson, setSelectedPerson] =
        useState<SearchInputOption | null>(null);

    const navigate = useNavigate();

    const {changeTabValue, selectFile, submitCreateAvatar, searchPerson} =
        useUnit(createAvatarModel.events);

    const {
        $avatarCreated,
        $selectedFile,
        $sendCreateAvatarPending,
        $tabValue,
        $persons,
    } = useUnit(createAvatarModel.stores);

    useEffect(() => {
        if ($avatarCreated) {
            navigate(generatePath('/'));
        }
    }, [$avatarCreated]);

    const handleTabChange = useCallback(
        (e: ValueChangeDetails) => {
            changeTabValue((e.value as TabValues) || null);
        },
        [changeTabValue]
    );

    const handleSelectedPersonChange = useCallback(
        (_, newValue: SearchInputOption) => {
            setSelectedPerson(newValue);
        },
        [setSelectedPerson]
    );

    const handleSearchPersonChange = useCallback(
        (_, newValue: string) => {
            searchPerson(newValue || '');
        },
        [searchPerson]
    );

    const onSubmit = (data: FormValues) => {
        submitCreateAvatar({personId: selectedPerson?.id, ...data});
    };

    const handleFileChange = useCallback(
        (e: SyntheticEvent<HTMLInputElement, MouseEvent>) => {
            const file = (e?.target as HTMLInputElement)?.files?.[0];

            if (file) {
                selectFile(file);
            }
        },
        [selectFile]
    );

    const persons: {id: string; label: string}[] = ($persons || []).map(
        person => {
            const {name, secondName, surname} = person;

            const fullName =
                surname || name ? `${surname} ${name} ${secondName}` : '';

            return {
                id: person?.id || '',
                label: fullName,
            };
        }
    );

    return (
        <Theme appearance="light">
            <div className={styles.root}>
                <section className={styles.pagesSection}>
                    <div className={styles.formWrapper}>
                        <div className={styles.headerTitle}>
                            <Text fontWeight="normal" textStyle="xl">
                                Добавить страницу
                            </Text>
                        </div>

                        <form
                            encType="multipart/form-data"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div>
                                <Text
                                    className={styles.fileUploadLabel}
                                    fontWeight="medium"
                                    textStyle="sm"
                                >
                                    Выберите файл
                                </Text>
                                <FileUploadRoot
                                    accept={['text/csv']}
                                    className={styles.fileUpload}
                                    onChange={handleFileChange}
                                    required
                                >
                                    <FileUploadTrigger>
                                        <Button variant="surface" size="sm">
                                            <HiUpload /> CSV-файл
                                        </Button>
                                    </FileUploadTrigger>
                                    <FileUploadList
                                        className={styles.uploadedFiles}
                                    />
                                </FileUploadRoot>
                            </div>

                            <Flex gap="4">
                                <Field
                                    className={styles.formControl}
                                    errorText={errors.username?.message}
                                    invalid={!!errors.username}
                                    label="Username"
                                    required
                                >
                                    <Input
                                        size="sm"
                                        {...register('username', {
                                            required: 'Обязательно',
                                            maxLength: 50,
                                        })}
                                    />
                                </Field>

                                <Field
                                    className={styles.formControl}
                                    errorText={errors.url?.message}
                                    invalid={!!errors.url}
                                    label="Ссылка"
                                    required
                                >
                                    <Input
                                        size="sm"
                                        {...register('url', {
                                            required: 'Обязательно',
                                            maxLength: 50,
                                        })}
                                    />
                                </Field>
                            </Flex>

                            <Tabs.Root
                                className={styles.formControl}
                                fitted
                                lazyMount
                                unmountOnExit
                                onValueChange={handleTabChange}
                                size="lg"
                                variant="plain"
                            >
                                <Tabs.List
                                    bg="bg.muted"
                                    rounded="l3"
                                    mt="5"
                                    mb="2"
                                    p="1"
                                >
                                    {tabs.map(tab => (
                                        <Tabs.Trigger
                                            key={tab.value}
                                            value={tab.value}
                                        >
                                            <Flex direction="column">
                                                <Text textStyle="sm">
                                                    {tab.title}
                                                </Text>
                                                <Text textStyle="2xs">
                                                    {tab.description}
                                                </Text>
                                            </Flex>
                                        </Tabs.Trigger>
                                    ))}
                                    <Tabs.Indicator rounded="l2" />
                                </Tabs.List>

                                <Tabs.Content value={TabValues.NEW}>
                                    <Flex gap="4">
                                        <Field
                                            className={styles.formControl}
                                            errorText={errors.surname?.message}
                                            invalid={!!errors.surname}
                                            label="Фамилия"
                                            required={
                                                $tabValue === TabValues.NEW
                                            }
                                        >
                                            <Input
                                                size="sm"
                                                {...register('surname', {
                                                    required:
                                                        $tabValue ===
                                                        TabValues.NEW
                                                            ? 'Обязательно'
                                                            : false,
                                                    maxLength: 50,
                                                })}
                                            />
                                        </Field>

                                        <Field
                                            className={styles.formControl}
                                            errorText={errors.name?.message}
                                            invalid={!!errors.name}
                                            label="Имя"
                                            required={
                                                $tabValue === TabValues.NEW
                                            }
                                        >
                                            <Input
                                                size="sm"
                                                {...register('name', {
                                                    required:
                                                        $tabValue ===
                                                        TabValues.NEW
                                                            ? 'Обязательно'
                                                            : false,
                                                    maxLength: 50,
                                                })}
                                            />
                                        </Field>

                                        <Field
                                            className={styles.formControl}
                                            errorText={
                                                errors.secondName?.message
                                            }
                                            invalid={!!errors.secondName}
                                            label="Отчество"
                                        >
                                            <Input
                                                size="sm"
                                                {...register('secondName', {
                                                    maxLength: 50,
                                                })}
                                            />
                                        </Field>
                                    </Flex>

                                    <Field
                                        className={styles.formControl}
                                        errorText={errors.address?.message}
                                        invalid={!!errors.address}
                                        label="Адрес"
                                    >
                                        <Input
                                            size="sm"
                                            {...register('address', {
                                                maxLength: 300,
                                            })}
                                        />
                                    </Field>

                                    <Flex gap="4">
                                        <Field
                                            className={styles.formControl}
                                            errorText={errors.age?.message}
                                            invalid={!!errors.age}
                                            label="Возраст"
                                        >
                                            <Input
                                                size="sm"
                                                {...register('age', {
                                                    pattern: /^\d{1,2}$/,
                                                })}
                                            />
                                        </Field>

                                        <Field
                                            className={styles.formControl}
                                            errorText={errors.phone?.message}
                                            invalid={!!errors.phone}
                                            label="Телефон"
                                        >
                                            <Input
                                                size="sm"
                                                {...register('phone', {
                                                    pattern: /^[\d+\-)( ]+$/,
                                                    maxLength: 22,
                                                })}
                                            />
                                        </Field>

                                        <Field
                                            className={styles.formControl}
                                            errorText={
                                                errors.organization?.message
                                            }
                                            invalid={!!errors.organization}
                                            label="Организация"
                                        >
                                            <Input
                                                size="sm"
                                                {...register('organization', {
                                                    maxLength: 300,
                                                })}
                                            />
                                        </Field>
                                    </Flex>

                                    <Field
                                        className={styles.formControl}
                                        errorText={errors.description?.message}
                                        invalid={!!errors.description}
                                        label="Дополнительно"
                                    >
                                        <Textarea
                                            autoresize
                                            maxH="8lh"
                                            size="sm"
                                            {...register('description', {
                                                maxLength: 300,
                                            })}
                                        />
                                    </Field>
                                </Tabs.Content>

                                <Tabs.Content value={TabValues.EXISTING}>
                                    <SearchInput
                                        label="ФИО"
                                        name="personId"
                                        onChange={handleSelectedPersonChange}
                                        onInputChange={handleSearchPersonChange}
                                        options={persons}
                                        required={
                                            $tabValue === TabValues.EXISTING
                                        }
                                        showOptionIds={true}
                                        value={selectedPerson}
                                    />
                                </Tabs.Content>
                            </Tabs.Root>

                            <div className={styles.submitButtonWrapper}>
                                <Button
                                    colorPalette="teal"
                                    disabled={
                                        !isValid || !$tabValue || !$selectedFile
                                    }
                                    loading={$sendCreateAvatarPending}
                                    type="submit"
                                    variant="solid"
                                >
                                    Добавить
                                </Button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </Theme>
    );
};
