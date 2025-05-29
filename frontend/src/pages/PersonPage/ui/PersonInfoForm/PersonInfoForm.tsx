import {useEffect} from 'react';
import {Flex, Input, Textarea} from '@chakra-ui/react';
import {useForm} from 'react-hook-form';
import {useMount} from 'react-use';
import {useUnit} from 'effector-react';

import {Button} from 'src/components/ui/button';
import {Field} from 'src/components/ui/field';
import {Loader} from 'src/shared/components/Loader';

import {personModel} from '../../model';

import styles from './PersonInfoForm.module.css';

interface FormValues {
    surname: string;
    name: string;
    secondName: string;
    address: string;
    age: number;
    phone: string;
    organization: string;
    description: string;
}

interface PersonInfoFormProps {
    personId: string;
}

/**
 * Компонент формы для просмотра и редактирования данных о Персоне
 *
 * @param personId
 */
export const PersonInfoForm = ({personId}: PersonInfoFormProps) => {
    const {
        $personWithAvatars: personWithAvatars,
        $personChangeSubmitted,
        $submitPersonChangePending,
    } = useUnit(personModel.stores);
    const {getPersonWithAvatars, submitPersonChange} = useUnit(
        personModel.events
    );

    useMount(() => {
        if (!personId) {
            return;
        }

        if (!personWithAvatars) {
            getPersonWithAvatars(personId);
        }
    });

    const {
        surname,
        name,
        secondName,
        address,
        age,
        phone,
        organization,
        description,
    } = personWithAvatars || {};

    const {
        register,
        handleSubmit,
        formState: {errors, isDirty, isValid},
    } = useForm<FormValues>({
        defaultValues: {
            surname,
            name,
            secondName,
            address,
            age,
            phone,
            organization,
            description,
        },
    });

    useEffect(() => {
        if ($personChangeSubmitted) {
            window.location.reload();
        }
    }, [$personChangeSubmitted]);

    const onSubmit = handleSubmit(data => {
        submitPersonChange({id: personId, ...data});
    });

    if (!personWithAvatars) {
        return <Loader />;
    }

    return (
        <form className={styles.userInfoForm} onSubmit={onSubmit}>
            <Flex gap="4">
                <Field
                    className={styles.formControl}
                    errorText={errors.surname?.message}
                    invalid={!!errors.surname}
                    label="Фамилия"
                    required
                >
                    <Input
                        size="sm"
                        {...register('surname', {
                            required: 'Обязательно',
                            maxLength: 50,
                        })}
                    />
                </Field>

                <Field
                    className={styles.formControl}
                    errorText={errors.name?.message}
                    invalid={!!errors.name}
                    label="Имя"
                    required
                >
                    <Input
                        size="sm"
                        {...register('name', {
                            required: 'Обязательно',
                            maxLength: 50,
                        })}
                    />
                </Field>

                <Field
                    className={styles.formControl}
                    errorText={errors.secondName?.message}
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
                    errorText={errors.organization?.message}
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

            <div className={styles.submitButtonWrapper}>
                <Button
                    colorPalette="teal"
                    disabled={!isDirty || !isValid}
                    loading={$submitPersonChangePending}
                    variant="solid"
                    size="sm"
                    type="submit"
                >
                    Сохранить изменения
                </Button>
            </div>
        </form>
    );
};
