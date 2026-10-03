import { useState } from 'react'
import {
    Box,
    Button,
    Field,
    Flex,
    Grid,
    Heading,
    Icon,
    Input,
    Slider,
    Text,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import {
    PiBowlFood,
    PiCalendarBlank,
    PiForkKnife,
    PiMagicWand,
} from 'react-icons/pi'
import { componentsApi, mealPlansApi, recipesApi } from '@/api'
import MultiSelectField from '@/components/ui/MultiSelectField'
import IngredientSearchSelect from '@/components/Ingredients/IngredientSearchSelect'
import PlannerRules from './PlannerRules'

const card = {
    p: '14px',
    bg: '#fffdf9',
    border: '1px solid #e7e0d5',
    borderRadius: '14px',
}
const errorText = (error) => {
    const data = error?.response?.data
    return (
        [
            data?.detail,
            data?.message,
            data?.start_date,
            data?.days,
            data?.priority_recipes,
            data?.priority_components,
        ]
            .flat()
            .filter((message) => typeof message === 'string')
            .join(' ') ||
        'No hemos podido generar el menú. Vuelve a intentarlo.'
    )
}
function PriorityField({ api, name, label, ids, onChange, disabled }) {
    const query = useQuery({
        queryKey: [...api.keys.lists(), 'planner-priorities'],
        queryFn: async ({ signal }) => {
            const entries = []
            let page = 1
            let data
            do {
                data = await api.list(
                    { page, page_size: 100, ordering: 'name', is_active: true },
                    { signal },
                )
                entries.push(
                    ...(Array.isArray(data) ? data : (data.results ?? [])),
                )
                page += 1
            } while (data.next)
            return entries.filter((entry) => entry.is_active !== false)
        },
    })
    const options = (query.data ?? []).map((entry) => ({
        value: Number(entry.id),
        label: entry.name,
    }))
    return (
        <Field.Root {...card}>
            <Field.Label htmlFor={name}>{label} (opcional)</Field.Label>
            <MultiSelectField
                inputId={name}
                instanceId={name}
                name={name}
                options={options}
                value={ids.map(
                    (id) =>
                        options.find(
                            (option) => option.value === Number(id),
                        ) ?? { value: Number(id), label: `ID ${id}` },
                )}
                onChange={(selected) =>
                    onChange(selected.map((option) => option.value))
                }
                isLoading={query.isFetching}
                isDisabled={disabled}
                placeholder={`Buscar ${label.toLowerCase()}…`}
            />
            {query.isError && (
                <Text color="red.600" fontSize="xs" role="alert">
                    No se pudieron cargar las opciones.{' '}
                    <Button
                        size="xs"
                        variant="plain"
                        type="button"
                        onClick={() => query.refetch()}
                    >
                        Reintentar
                    </Button>
                </Text>
            )}
        </Field.Root>
    )
}
function PlannerForm({ initialValues, isGenerating, error, onGenerate }) {
    const rulesQuery = useQuery(mealPlansApi.queries.rules())
    const [startDate, setStartDate] = useState(initialValues.start_date)
    const [days, setDays] = useState(initialValues.days ?? 5)
    const [recipes, setRecipes] = useState(initialValues.priority_recipes ?? [])
    const [components, setComponents] = useState(
        initialValues.priority_components ?? [],
    )
    const [ingredients, setIngredients] = useState(
        initialValues.priority_ingredient_options ?? [],
    )
    const submit = (event) => {
        event.preventDefault()
        if (isGenerating || !startDate || !rulesQuery.isSuccess) return
        onGenerate({
            start_date: startDate,
            days: Number(days),
            priority_recipes: recipes.map(Number),
            priority_components: components.map(Number),
            priority_ingredients: ingredients.map((option) =>
                Number(option.value),
            ),
            priority_ingredient_options: ingredients,
        })
    }
    return (
        <Box
            as="section"
            minH="100%"
            px={{ base: '15px', sm: '21px' }}
            py="25px"
            color="#30312c"
        >
            <Flex
                as="header"
                align="center"
                justify="space-between"
                gap="8px"
                mb="17px"
                p="20px 18px"
                minH="166px"
                bg="linear-gradient(140deg, #fffdf7 15%, #edf2df)"
                border="1px solid #e6e6d6"
                borderRadius="20px"
            >
                <Box>
                    <Text
                        color="#8d7457"
                        fontSize="9px"
                        fontWeight="bold"
                        textTransform="uppercase"
                    >
                        Tu semana, organizada
                    </Text>
                    <Heading as="h1" my="5px" fontSize="25px">
                        Planificador
                    </Heading>
                    <Text color="#77756e" fontSize="12px">
                        Crea un menú personalizado en segundos.
                    </Text>
                </Box>
                <Icon
                    as={PiBowlFood}
                    boxSize="80px"
                    flexShrink="0"
                    color="#a86b36"
                    aria-hidden="true"
                />
            </Flex>
            <Grid as="form" gap="16px" onSubmit={submit}>
                <Field.Root {...card} required disabled={isGenerating}>
                    <Field.Label htmlFor="planner-start-date">
                        <Icon as={PiCalendarBlank} color="#34784a" /> Fecha de
                        inicio
                    </Field.Label>
                    <Input
                        id="planner-start-date"
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        required
                        bg="#faf8f3"
                    />
                    <Field.HelperText>
                        Por defecto seleccionamos el lunes más cercano.
                    </Field.HelperText>
                </Field.Root>
                <Box {...card}>
                    <Slider.Root
                        min={1}
                        max={7}
                        step={1}
                        value={[Number(days)]}
                        onValueChange={({ value }) => setDays(value[0])}
                        disabled={isGenerating}
                        colorPalette="green"
                    >
                        <Flex justify="space-between" mb="16px">
                            <Slider.Label>
                                <Icon as={PiForkKnife} /> Días a planificar
                            </Slider.Label>
                            <Slider.ValueText>{days} días</Slider.ValueText>
                        </Flex>
                        <Slider.Control>
                            <Slider.Track>
                                <Slider.Range />
                            </Slider.Track>
                            <Slider.Thumb index={0}>
                                <Slider.HiddenInput />
                            </Slider.Thumb>
                        </Slider.Control>
                    </Slider.Root>
                    <Flex
                        justify="space-between"
                        mt="8px"
                        color="#77756e"
                        fontSize="10px"
                        aria-hidden="true"
                    >
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <Text key={day}>{day}</Text>
                        ))}
                    </Flex>
                </Box>
                <PriorityField
                    api={recipesApi}
                    name="priority_recipes"
                    label="Recetas prioritarias"
                    ids={recipes}
                    onChange={setRecipes}
                    disabled={isGenerating}
                />
                <PriorityField
                    api={componentsApi}
                    name="priority_components"
                    label="Componentes prioritarios"
                    ids={components}
                    onChange={setComponents}
                    disabled={isGenerating}
                />
                <Field.Root {...card} disabled={isGenerating}>
                    <Field.Label htmlFor="priority_ingredients">
                        Ingredientes prioritarios (opcional)
                    </Field.Label>
                    <IngredientSearchSelect
                        isMulti
                        inputId="priority_ingredients"
                        instanceId="priority_ingredients"
                        value={ingredients}
                        onChange={(selected) => setIngredients(selected ?? [])}
                        isDisabled={isGenerating}
                        placeholder="Buscar ingredientes…"
                    />
                </Field.Root>
                {error && (
                    <Text
                        role="alert"
                        p="12px"
                        color="#98433d"
                        bg="#fff0ec"
                        borderRadius="10px"
                        fontSize="xs"
                    >
                        {errorText(error)}
                    </Text>
                )}
                <Button
                    type="submit"
                    disabled={
                        isGenerating || !startDate || !rulesQuery.isSuccess
                    }
                    loading={isGenerating}
                    loadingText="Creando tu menú…"
                    colorPalette="green"
                    h="48px"
                    borderRadius="11px"
                >
                    <PiMagicWand /> Generar menú semanal
                </Button>
                <PlannerRules query={rulesQuery} />
            </Grid>
        </Box>
    )
}
export default PlannerForm
