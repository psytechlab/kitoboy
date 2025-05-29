import {useEffect} from 'react';
import {generatePath, useNavigate} from 'react-router-dom';
import {AbsoluteCenter, Flex, Button, Input, Text} from '@chakra-ui/react';
import {useForm} from 'react-hook-form';
import {useUnit} from 'effector-react';

import {Field} from 'src/components/ui/field';
import {authModel} from 'src/shared/models/auth.model';

import styles from './LoginPage.module.css';

interface FormValues {
    username: string;
    password: string;
}

const regexValidationRule = {
    value: /^[\w_-]+$/,
    message:
        'Поле может содержать только латинские буквы, цифры и символы "_" и "-"',
};

const maxLengthValidationRule = {
    value: 30,
    message: 'Поле может содержать не более 30 символов',
};

/**
 * Компонент страницы авторизации пользователя по логину и паролю
 */
export const LoginPage = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: {errors, isValid},
    } = useForm<FormValues>();
    const {login} = useUnit(authModel.events);
    const {$isAuthenticated} = useUnit(authModel.stores);

    useEffect(() => {
        if ($isAuthenticated) {
            navigate(generatePath('/'));
        }
    }, [$isAuthenticated]);

    const onSubmit = handleSubmit(data => {
        if (isValid) {
            login({username: data.username, password: data.password});
        }
    });

    return (
        <AbsoluteCenter p="4" axis="both">
            <div className={styles.root}>
                <form onSubmit={onSubmit}>
                    <Text fontWeight="medium" textStyle="xl" mb={4}>
                        Авторизация
                    </Text>
                    <Field
                        className={styles.formControl}
                        errorText={errors.username?.message}
                        invalid={!!errors.username}
                        label="Логин"
                    >
                        <Input
                            size="sm"
                            {...register('username', {
                                maxLength: maxLengthValidationRule,
                                pattern: regexValidationRule,
                                required: 'Обязательно',
                            })}
                        />
                    </Field>
                    <Field
                        className={styles.formControl}
                        errorText={errors.password?.message}
                        invalid={!!errors.password}
                        label="Пароль"
                    >
                        <Input
                            size="sm"
                            type="password"
                            {...register('password', {
                                maxLength: maxLengthValidationRule,
                                pattern: regexValidationRule,
                                required: 'Обязательно',
                            })}
                        />
                    </Field>
                    <Flex justify="end" w="100%" mt={3}>
                        <Button
                            colorPalette="teal"
                            type="submit"
                            variant="solid"
                        >
                            Войти
                        </Button>
                    </Flex>
                </form>
            </div>
        </AbsoluteCenter>
    );
};
