import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Input, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { FieldArray, getIn } from 'formik'
import { PiMinus, PiPlus } from 'react-icons/pi'
import CreatableSelect from 'react-select/creatable'
import { ingredientsApi } from '@/api'
import { createEmptyIngredient } from './utils'

const UNITS = ['g', 'kg', 'ml', 'l', 'ud', 'cda', 'cdta']
const COLORS = {
    border: '#e7dfd3',
    danger: '#bd4d4d',
    green: '#397c3d',
    greenSoft: '#e9f2df',
    ink: '#302d28',
}

const getError = (formik, name) => {
    const error = getIn(formik.errors, name)
    return getIn(formik.touched, name) && typeof error === 'string'
        ? error
        : null
}

const control = (invalid = false) => ({
    w: '100%',
    h: '38px',
    px: '8px',
    color: COLORS.ink,
    bg: 'rgba(255,253,249,.76)',
    border: '1px solid',
    borderColor: invalid ? COLORS.danger : COLORS.border,
    borderRadius: '8px',
    fontSize: '11px',
    _focusVisible: {
        borderColor: invalid ? COLORS.danger : '#86b47c',
        boxShadow: `0 0 0 3px ${invalid ? 'rgba(189,77,77,.1)' : 'rgba(86,157,83,.1)'}`,
    },
})

function ErrorText({ formik, name }) {
    const error = getError(formik, name)
    if (!error) return null
    return (
        <Text mt="4px" color={COLORS.danger} fontSize="11px" role="alert">
            {error}
        </Text>
    )
}

function useDebouncedValue(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timeoutId = window.setTimeout(
            () => setDebouncedValue(value.trim()),
            delay,
        )
        return () => window.clearTimeout(timeoutId)
    }, [delay, value])

    return debouncedValue
}

const getResults = (data) =>
    Array.isArray(data) ? data : (data?.results ?? [])

const selectStyles = (invalid) => ({
    control: (base, state) => ({
        ...base,
        minHeight: '38px',
        height: '38px',
        background: 'rgba(255,253,249,.76)',
        borderColor: invalid
            ? COLORS.danger
            : state.isFocused
              ? '#86b47c'
              : COLORS.border,
        borderRadius: '8px',
        boxShadow: state.isFocused
            ? `0 0 0 3px ${invalid ? 'rgba(189,77,77,.1)' : 'rgba(86,157,83,.1)'}`
            : 'none',
        fontSize: '11px',
        '&:hover': { borderColor: invalid ? COLORS.danger : '#86b47c' },
    }),
    valueContainer: (base) => ({ ...base, padding: '0 8px' }),
    input: (base) => ({ ...base, margin: 0, color: COLORS.ink }),
    indicatorsContainer: (base) => ({ ...base, height: '36px' }),
    menu: (base) => ({ ...base, zIndex: 20, fontSize: '12px' }),
    option: (base, state) => ({
        ...base,
        color: COLORS.ink,
        background: state.isSelected
            ? COLORS.greenSoft
            : state.isFocused
              ? '#f5f0e8'
              : '#fffdf9',
    }),
})

function IngredientSelect({ formik, item, rowName, index, invalid }) {
    const [inputValue, setInputValue] = useState('')
    const debouncedSearch = useDebouncedValue(inputValue)
    const searchQuery = useQuery(ingredientsApi.queries.search(debouncedSearch))
    const options = useMemo(() => {
        if (
            debouncedSearch.length < 3 ||
            debouncedSearch !== inputValue.trim()
        ) {
            return []
        }
        return getResults(searchQuery.data).map((ingredient) => ({
            value: ingredient.id,
            label: ingredient.name,
        }))
    }, [debouncedSearch, inputValue, searchQuery.data])
    const value = item.ingredient_id
        ? { value: item.ingredient_id, label: item.name }
        : item.name
          ? { value: `new:${item.name}`, label: item.name, __isNew__: true }
          : null

    return (
        <CreatableSelect
            instanceId={`${rowName}-select`}
            inputId={`${rowName}-select`}
            aria-label={`Ingrediente ${index + 1}`}
            value={value}
            options={options}
            inputValue={inputValue}
            isLoading={searchQuery.isFetching}
            isClearable
            filterOption={null}
            styles={selectStyles(invalid)}
            placeholder="Buscar ingrediente"
            formatCreateLabel={(text) =>
                `Usar "${text}" como nuevo ingrediente`
            }
            noOptionsMessage={() => {
                if (inputValue.trim().length < 3) {
                    return 'Escribe al menos 3 letras'
                }
                if (searchQuery.isError) return 'No se pudo buscar'
                if (searchQuery.isFetching) return 'Buscando…'
                return 'Sin resultados'
            }}
            onInputChange={(nextValue, action) => {
                if (action.action === 'input-change') setInputValue(nextValue)
            }}
            onChange={(option) => {
                formik.setFieldValue(
                    `${rowName}.ingredient_id`,
                    option && !option.__isNew__ ? option.value : '',
                )
                formik.setFieldValue(`${rowName}.name`, option?.label ?? '')
                setInputValue('')
            }}
            onBlur={() => formik.setFieldTouched(`${rowName}.name`, true)}
        />
    )
}

/** Shared searchable ingredient editor for recipes and food components. */
function IngredientsField({ formik, name = 'ingredients' }) {
    const values = getIn(formik.values, name) ?? []

    return (
        <FieldArray name={name}>
            {({ push, remove }) => (
                <Box
                    as="section"
                    p="13px 12px 10px"
                    bg="rgba(255,253,249,.48)"
                    border="1px solid"
                    borderColor={COLORS.border}
                    borderRadius="12px"
                >
                    <Flex align="center" justify="space-between" mb="9px">
                        <Heading as="h2" fontSize="12px">
                            Ingredientes
                        </Heading>
                        <Text
                            minW="22px"
                            px="6px"
                            py="2px"
                            color={COLORS.green}
                            bg={COLORS.greenSoft}
                            borderRadius="10px"
                            textAlign="center"
                            fontSize="10px"
                        >
                            {values.length}
                        </Text>
                    </Flex>

                    <Grid gap="8px">
                        {values.map((item, index) => {
                            const rowName = `${name}.${index}`
                            const rowError = getError(formik, rowName)
                            return (
                                <Grid
                                    key={index}
                                    templateColumns="minmax(0,1.6fr) 72px 64px 30px"
                                    gap={{ base: '4px', sm: '6px' }}
                                    alignItems="start"
                                >
                                    <Box minW="0">
                                        <IngredientSelect
                                            formik={formik}
                                            item={item}
                                            rowName={rowName}
                                            index={index}
                                            invalid={Boolean(
                                                rowError ||
                                                getError(
                                                    formik,
                                                    `${rowName}.name`,
                                                ),
                                            )}
                                        />
                                        <ErrorText
                                            formik={formik}
                                            name={rowName}
                                        />
                                        <ErrorText
                                            formik={formik}
                                            name={`${rowName}.name`}
                                        />
                                    </Box>
                                    <Box>
                                        <Input
                                            {...control(
                                                Boolean(
                                                    getError(
                                                        formik,
                                                        `${rowName}.quantity`,
                                                    ),
                                                ),
                                            )}
                                            name={`${rowName}.quantity`}
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={item.quantity}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="Cant."
                                            aria-label={`Cantidad ${index + 1}`}
                                        />
                                        <ErrorText
                                            formik={formik}
                                            name={`${rowName}.quantity`}
                                        />
                                    </Box>
                                    <Box
                                        as="select"
                                        {...control(
                                            Boolean(
                                                getError(
                                                    formik,
                                                    `${rowName}.unit`,
                                                ),
                                            ),
                                        )}
                                        name={`${rowName}.unit`}
                                        value={item.unit}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        aria-label={`Unidad ${index + 1}`}
                                    >
                                        <option value="">Unidad…</option>
                                        {UNITS.map((unit) => (
                                            <option key={unit} value={unit}>
                                                {unit}
                                            </option>
                                        ))}
                                    </Box>
                                    <Button
                                        type="button"
                                        minW="25px"
                                        w="25px"
                                        h="25px"
                                        mt="7px"
                                        mx="auto"
                                        p="0"
                                        color={COLORS.danger}
                                        bg="#fff7f5"
                                        border="1px solid #e98f8f"
                                        borderRadius="50%"
                                        aria-label={`Quitar ingrediente ${index + 1}`}
                                        onClick={() => remove(index)}
                                    >
                                        <PiMinus />
                                    </Button>
                                </Grid>
                            )
                        })}
                    </Grid>
                    <Button
                        type="button"
                        mt="8px"
                        px="8px"
                        py="3px"
                        h="auto"
                        color={COLORS.green}
                        bg="transparent"
                        fontSize="12px"
                        fontWeight="650"
                        onClick={() => push(createEmptyIngredient())}
                    >
                        <PiPlus /> Añadir ingrediente
                    </Button>
                </Box>
            )}
        </FieldArray>
    )
}

export default IngredientsField
