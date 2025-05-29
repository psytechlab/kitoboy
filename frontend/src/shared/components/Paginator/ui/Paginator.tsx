import {Group, IconButton, Pagination} from '@chakra-ui/react';
import {LuChevronLeft, LuChevronRight} from 'react-icons/lu';

type Props = {
    className?: string;
    count: number;
    onPageChange: () => void;
    page: number;
    pageSize: number;
};

/**
 * Компонент для навигации по страницам
 *
 * @param className
 * @param count
 * @param onPageChange
 * @param page
 * @param pageSize
 */
export const Paginator = ({
    className,
    count,
    onPageChange,
    page,
    pageSize,
}: Props) => {
    return (
        <Pagination.Root
            className={className}
            count={count}
            page={page}
            pageSize={pageSize}
            defaultPage={1}
            onPageChange={onPageChange}
        >
            <Group>
                <Pagination.PrevTrigger asChild>
                    <IconButton
                        size="xs"
                        variant={{base: 'ghost', _selected: 'outline'}}
                    >
                        <LuChevronLeft />
                    </IconButton>
                </Pagination.PrevTrigger>

                <Pagination.Context>
                    {({pages}) =>
                        pages.map((page, index) =>
                            page.type === 'page' ? (
                                <Pagination.Item asChild key={index} {...page}>
                                    <IconButton
                                        size="xs"
                                        variant={{
                                            base: 'ghost',
                                            _selected: 'outline',
                                        }}
                                    >
                                        {page.value}
                                    </IconButton>
                                </Pagination.Item>
                            ) : (
                                <Pagination.Ellipsis key={index} index={index}>
                                    <IconButton
                                        size="xs"
                                        variant={{
                                            base: 'ghost',
                                            _selected: 'outline',
                                        }}
                                    >
                                        ...
                                    </IconButton>
                                </Pagination.Ellipsis>
                            )
                        )
                    }
                </Pagination.Context>

                <Pagination.NextTrigger asChild>
                    <IconButton
                        size="xs"
                        variant={{base: 'ghost', _selected: 'outline'}}
                    >
                        <LuChevronRight />
                    </IconButton>
                </Pagination.NextTrigger>
            </Group>
        </Pagination.Root>
    );
};
