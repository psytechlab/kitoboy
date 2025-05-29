import {Spinner} from '@chakra-ui/react';
import cx from 'classnames';

export type LoaderProps = {
    className?: string;
};

/**
 * Компонент вращающегося лоадера
 * @param className
 */
export const Loader = ({className}: LoaderProps) => {
    return <Spinner className={cx(className)} color="gray.950" size="xl" />;
};
