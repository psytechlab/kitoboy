import {createTheme, ThemeProvider} from '@mui/material/styles';
import {teal} from '@mui/material/colors';
import {Autocomplete, Box, TextField} from '@mui/material';
import {Text} from '@chakra-ui/react';

const theme = createTheme({
    palette: {
        primary: {
            main: teal[400],
        },
    },
});

export type SearchInputOption = {
    id: string;
    label: string;
    color?: string;
};

type Props = {
    label: string;
    name: string;
    onChange?: () => void;
    onInputChange?: () => void;
    options: SearchInputOption[];
    required?: boolean;
    showOptionIds?: boolean;
    size?: 'md' | 'xs';
    value?: SearchInputOption;
};

/**
 * Компонент текстового инпута с выпадающим списком с возможностью выбора и с обработкой поиска при вводе
 *
 * @param label
 * @param name
 * @param onChange
 * @param onInputChange
 * @param options
 * @param required
 * @param showOptionIds
 * @param size
 * @param value
 */
export const SearchInput = ({
    label,
    name,
    onChange,
    onInputChange,
    options,
    required = false,
    showOptionIds,
    size = 'md',
    value,
}: Props) => {
    return (
        <ThemeProvider theme={theme}>
            <Autocomplete
                disablePortal
                filterOptions={x => x}
                onChange={onChange}
                onInputChange={onInputChange}
                options={options}
                size="small"
                renderInput={params => (
                    <TextField
                        {...params}
                        label={label}
                        name={name}
                        required={required}
                        size="small"
                    />
                )}
                renderOption={(props, option) => {
                    const {key, ...optionProps} = props;
                    return (
                        <Box
                            component="li"
                            key={key}
                            style={{
                                backgroundColor: `${option.color}`,
                            }}
                            sx={{
                                mr: '2px',
                                ml: '2px',
                                '& + &': {
                                    mt: '2px',
                                },
                            }}
                            {...optionProps}
                        >
                            <Text textStyle={size}>{option.label}</Text>
                            {showOptionIds && (
                                <Text
                                    color="gray.400"
                                    textStyle="xs"
                                    fontWeight="medium"
                                >
                                    {option.id}
                                </Text>
                            )}
                        </Box>
                    );
                }}
                value={value}
            />
        </ThemeProvider>
    );
};
