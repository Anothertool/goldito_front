import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ingredientsApi } from '@/api'
import MultiSelectField from '@/components/ui/MultiSelectField'

const getResults = (data) =>
    Array.isArray(data) ? data : (data?.results ?? [])

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

function IngredientSearchSelect({
    value,
    onChange,
    onBlur,
    creatable = false,
    isMulti = false,
    ...props
}) {
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

    return (
        <MultiSelectField
            creatable={creatable}
            isMulti={isMulti}
            value={value}
            options={options}
            inputValue={inputValue}
            isLoading={searchQuery.isFetching}
            isClearable
            filterOption={null}
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
                onChange(option)
                setInputValue('')
            }}
            onBlur={onBlur}
            {...props}
        />
    )
}

export default IngredientSearchSelect
