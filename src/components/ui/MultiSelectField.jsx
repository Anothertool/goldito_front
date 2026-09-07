import { Box } from '@chakra-ui/react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'

export default function MultiSelectField({
    isMulti = true,
    creatable = false,
    invalid = false,
    ...props
}) {
    const SelectComponent = creatable ? CreatableSelect : Select
    return (
        <Box minW="0" w="100%">
            <SelectComponent
                isMulti={isMulti}
                isClearable
                closeMenuOnSelect={!isMulti}
                aria-invalid={invalid || undefined}
                placeholder="Seleccionar…"
                noOptionsMessage={() => 'Sin resultados'}
                loadingMessage={() => 'Cargando…'}
                styles={{
                    control: (base, state) => ({
                        ...base,
                        minHeight: 38,
                        background: '#fffdf9',
                        borderRadius: 8,
                        borderColor: invalid
                            ? '#bd4d4d'
                            : state.isFocused
                              ? '#86b47c'
                              : '#e7dfd3',
                        boxShadow: state.isFocused
                            ? '0 0 0 3px #559b551a'
                            : 'none',
                        fontSize: 12,
                    }),
                    menu: (base) => ({ ...base, zIndex: 20, fontSize: 12 }),
                    multiValue: (base) => ({ ...base, background: '#e9f2df' }),
                    option: (base, state) => ({
                        ...base,
                        color: '#302d28',
                        background: state.isSelected
                            ? '#e9f2df'
                            : state.isFocused
                              ? '#f5f0e8'
                              : '#fffdf9',
                    }),
                }}
                {...props}
            />
        </Box>
    )
}
