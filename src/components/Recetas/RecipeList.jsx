import { useEffect, useState } from 'react'
import {
    Badge,
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    IconButton,
    Input,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
    PiBowlFood,
    PiCaretLeft,
    PiCaretRight,
    PiFunnel,
    PiMagnifyingGlass,
    PiPlus,
} from 'react-icons/pi'
import { recipeTagsApi, recipesApi } from '@/api'
import IngredientSearchSelect from '@/components/Ingredients/IngredientSearchSelect'
import RecipeCard from './RecipeCard'
import MultiSelectField from '@/components/ui/MultiSelectField'
import RecipeDetailModal from './RecipeDetailModal'

function useDebouncedValue(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
        return () => window.clearTimeout(timeout)
    }, [delay, value])
    return debouncedValue
}

export default function RecipeList() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [mealType, setMealType] = useState('')
    const [active, setActive] = useState('true')
    const [ordering, setOrdering] = useState('-updated_at')
    const [selectedIngredients, setSelectedIngredients] = useState([])
    const [selectedTags, setSelectedTags] = useState([])
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState(null)
    const debouncedSearch = useDebouncedValue(search)
    const recipesQuery = useQuery(
        recipesApi.queries.list({
            page,
            page_size: 20,
            ordering,
            ...(debouncedSearch && { search: debouncedSearch }),
            ...(mealType && { meal_type: mealType }),
            ...(active && { is_active: active }),
            ...(selectedIngredients.length && {
                ingredients: selectedIngredients
                    .map((option) => option.value)
                    .join(','),
            }),
            ...(selectedTags.length && {
                tags: selectedTags.map((option) => option.value).join(','),
            }),
        }),
    )
    const tagsQuery = useQuery(
        recipeTagsApi.queries.list({ page_size: 100, ordering: 'name' }),
    )
    const tags = Array.isArray(tagsQuery.data)
        ? tagsQuery.data
        : (tagsQuery.data?.results ?? [])
    const deleteRecipe = useMutation(recipesApi.mutations.remove())
    const recipes = Array.isArray(recipesQuery.data)
        ? recipesQuery.data
        : (recipesQuery.data?.results ?? [])
    const totalPages = Math.max(
        1,
        Math.ceil((recipesQuery.data?.count ?? recipes.length) / 20),
    )
    const hasFilters = Boolean(
        search ||
        mealType ||
        active !== 'true' ||
        selectedIngredients.length ||
        selectedTags.length,
    )
    const handleDelete = (recipe) => {
        if (window.confirm(`¿Quieres eliminar “${recipe.name}”?`))
            deleteRecipe.mutate(recipe.id)
    }
    const filters = [
        {
            id: 'meal-type',
            label: 'Tipo de comida',
            value: mealType,
            set: setMealType,
            options: [
                ['', 'Todos'],
                ['lunch', 'Comida'],
                ['dinner', 'Cena'],
            ],
        },
        {
            id: 'active',
            label: 'Estado',
            value: active,
            set: setActive,
            options: [
                ['', 'Todos'],
                ['true', 'Activas'],
                ['false', 'Inactivas'],
            ],
        },
        {
            id: 'ordering',
            label: 'Ordenar',
            value: ordering,
            set: setOrdering,
            options: [
                ['-updated_at', 'Última actualización'],
                ['name', 'Nombre A–Z'],
                ['-name', 'Nombre Z–A'],
            ],
        },
    ]
    return (
        <Box
            as="section"
            minH="100%"
            color="#302d28"
            px={{ base: '15px', sm: '22px' }}
            pt="7"
            pb="6"
        >
            <Flex as="header" align="center" justify="space-between" mb="5">
                <Flex align="center" gap="2.5">
                    <Badge
                        p="1.5"
                        bg="#fff0d9"
                        color="#c5854f"
                        borderRadius="9px"
                        fontSize="20px"
                    >
                        <PiBowlFood />
                    </Badge>
                    <Heading as="h1" fontSize="23px">
                        Recetas
                    </Heading>
                </Flex>
                <IconButton
                    aria-label="Crear receta"
                    bg="#559b55"
                    color="white"
                    borderRadius="12px"
                    onClick={() => navigate('/recetas/nueva')}
                >
                    <PiPlus />
                </IconButton>
            </Flex>
            <Flex gap="2" mb="3.5">
                <Flex
                    flex="1"
                    minW="0"
                    align="center"
                    gap="2"
                    px="3"
                    bg="#fffdf9"
                    border="1px solid #e7dfd3"
                    borderRadius="12px"
                    _focusWithin={{ borderColor: '#397c3d' }}
                >
                    <PiMagnifyingGlass aria-hidden="true" />
                    <Input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setPage(1)
                        }}
                        placeholder="Buscar recetas…"
                        aria-label="Buscar recetas"
                        variant="flushed"
                        border="0"
                        h="46px"
                    />
                </Flex>
                <IconButton
                    aria-label="Mostrar filtros"
                    aria-expanded={filtersOpen}
                    aria-controls="recipe-filters"
                    h="46px"
                    w="46px"
                    border="1px solid #e7dfd3"
                    borderRadius="12px"
                    bg={filtersOpen ? '#e9f2df' : '#fffdf9'}
                    color={filtersOpen ? '#397c3d' : '#4d4942'}
                    onClick={() => setFiltersOpen((open) => !open)}
                >
                    <PiFunnel />
                </IconButton>
            </Flex>
            {filtersOpen && (
                <Grid
                    id="recipe-filters"
                    templateColumns={{
                        base: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(3, minmax(0, 1fr))',
                    }}
                    gap="2.5"
                    mb="3.5"
                    p="3"
                    bg="#fffdf9"
                    border="1px solid #e7dfd3"
                    borderRadius="13px"
                >
                    {filters.map((filter) => (
                        <Box key={filter.id} minW="0">
                            <Text
                                as="label"
                                htmlFor={`recipe-${filter.id}`}
                                fontSize="11px"
                                fontWeight="700"
                                color="#777168"
                            >
                                {filter.label}
                            </Text>
                            <MultiSelectField
                                isMulti={false}
                                isClearable={false}
                                inputId={`recipe-${filter.id}`}
                                instanceId={`recipe-${filter.id}`}
                                options={filter.options.map(
                                    ([value, label]) => ({ value, label }),
                                )}
                                value={{
                                    value: filter.value,
                                    label: filter.options.find(
                                        ([value]) => value === filter.value,
                                    )?.[1],
                                }}
                                onChange={(option) => {
                                    filter.set(option.value)
                                    setPage(1)
                                }}
                            />
                        </Box>
                    ))}
                    <Box minW="0">
                        <Text
                            as="label"
                            htmlFor="recipe-ingredients"
                            fontSize="11px"
                            fontWeight="700"
                            color="#777168"
                        >
                            Ingredientes
                        </Text>
                        <IngredientSearchSelect
                            isMulti
                            inputId="recipe-ingredients"
                            instanceId="recipe-ingredients"
                            value={selectedIngredients}
                            onChange={(options) => {
                                setSelectedIngredients(options ?? [])
                                setPage(1)
                            }}
                            placeholder="Buscar ingredientes"
                        />
                    </Box>
                    <Box minW="0">
                        <Text
                            as="label"
                            htmlFor="recipe-tags"
                            fontSize="11px"
                            fontWeight="700"
                            color="#777168"
                        >
                            Etiquetas
                        </Text>
                        <MultiSelectField
                            inputId="recipe-tags"
                            instanceId="recipe-tags-filter"
                            options={tags.map((tag) => ({
                                value: tag.id,
                                label: tag.name,
                            }))}
                            value={selectedTags}
                            onChange={(options) => {
                                setSelectedTags(options ?? [])
                                setPage(1)
                            }}
                            isLoading={tagsQuery.isFetching}
                            noOptionsMessage={() =>
                                tagsQuery.isError
                                    ? 'No se pudieron cargar las etiquetas'
                                    : 'Sin resultados'
                            }
                            placeholder="Seleccionar etiquetas"
                        />
                    </Box>
                </Grid>
            )}
            {recipesQuery.isPending && (
                <Flex
                    minH="260px"
                    align="center"
                    justify="center"
                    gap="3"
                    role="status"
                >
                    <Spinner size="sm" color="#559b55" /> Cargando recetas…
                </Flex>
            )}
            {recipesQuery.isError && (
                <Stack
                    minH="260px"
                    align="center"
                    justify="center"
                    role="alert"
                >
                    <Text>No hemos podido cargar las recetas.</Text>
                    <Button onClick={() => recipesQuery.refetch()}>
                        Volver a intentar
                    </Button>
                </Stack>
            )}
            {!recipesQuery.isPending &&
                !recipesQuery.isError &&
                recipes.length === 0 && (
                    <Stack
                        minH="260px"
                        align="center"
                        justify="center"
                        textAlign="center"
                        gap="3"
                    >
                        <Box fontSize="60px" color="#d29a68">
                            <PiBowlFood />
                        </Box>
                        <Heading as="h2" size="md">
                            {hasFilters
                                ? 'No hay resultados'
                                : 'Tu recetario está vacío'}
                        </Heading>
                        <Text color="#777168" fontSize="13px">
                            {hasFilters
                                ? 'Prueba con otra búsqueda o cambia los filtros.'
                                : 'Crea tu primera receta para verla aquí.'}
                        </Text>
                        {!hasFilters && (
                            <Button
                                bg="#559b55"
                                color="white"
                                onClick={() => navigate('/recetas/nueva')}
                            >
                                Crear receta
                            </Button>
                        )}
                    </Stack>
                )}
            <Grid gap="3">
                {recipes.map((recipe) => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onOpen={() => setSelectedRecipe(recipe)}
                        onEdit={() => navigate(`/recetas/${recipe.id}/editar`)}
                        onDelete={() => handleDelete(recipe)}
                        deleting={
                            deleteRecipe.isPending &&
                            deleteRecipe.variables === recipe.id
                        }
                    />
                ))}
            </Grid>
            {deleteRecipe.isError && (
                <Text mt="3" color="red.600" role="alert" textAlign="center">
                    No se ha podido eliminar la receta.
                </Text>
            )}
            {totalPages > 1 && (
                <Flex
                    as="nav"
                    aria-label="Paginación de recetas"
                    align="center"
                    justify="space-between"
                    gap="2"
                    mt="5"
                    wrap="wrap"
                >
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={!recipesQuery.data?.previous}
                        onClick={() => setPage((value) => value - 1)}
                    >
                        <PiCaretLeft /> Anterior
                    </Button>
                    <Text fontSize="12px" color="#777168">
                        Página {page} de {totalPages}
                    </Text>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={!recipesQuery.data?.next}
                        onClick={() => setPage((value) => value + 1)}
                    >
                        Siguiente <PiCaretRight />
                    </Button>
                </Flex>
            )}
            <RecipeDetailModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
            />
        </Box>
    )
}
