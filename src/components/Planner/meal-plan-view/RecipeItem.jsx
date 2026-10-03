import {
    Button,
    Flex,
    Grid,
    Heading,
    Icon,
    Image,
    Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PiBowlFood, PiSnowflake, PiStarFill } from 'react-icons/pi'
import { recipesApi } from '@/api'
import MultiSelectField from '@/components/ui/MultiSelectField'
import RecipeScoreBreakdown from '../RecipeScoreBreakdown'

async function loadRecipes({ signal }) {
    const entries = []
    let page = 1
    let data
    do {
        data = await recipesApi.list(
            { page, page_size: 100, ordering: 'name', is_active: true },
            { signal },
        )
        entries.push(...(Array.isArray(data) ? data : (data.results ?? [])))
        page += 1
    } while (data.next)
    return entries
}

function RecipeItem({ item, onOpen, onChangeRecipe, canChange }) {
    const [isChanging, setIsChanging] = useState(false)
    const recipesQuery = useQuery({
        queryKey: [...recipesApi.keys.lists(), 'planner-replacements'],
        queryFn: loadRecipes,
        enabled: isChanging,
    })
    const recipe = item.recipe ?? {}
    const image = recipe.image ?? recipe.photo ?? recipe.image_url
    const isFromFreezer = Boolean(recipe.is_from_freezer)
    const isPreferred = Boolean(recipe.is_preferred)

    const openRecipe = () => {
        if (recipe.id != null) onOpen(recipe)
    }

    return (
        <Grid
            as="article"
            role={recipe.id != null ? 'link' : undefined}
            tabIndex={recipe.id != null ? 0 : undefined}
            aria-label={
                recipe.id != null
                    ? `Ver detalles de ${recipe.name ?? 'receta'}`
                    : undefined
            }
            onClick={openRecipe}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openRecipe()
                }
            }}
            minW="0"
            gridTemplateColumns={{
                base: '38px minmax(0, 1fr)',
                sm: '46px minmax(0, 1fr)',
            }}
            alignItems="center"
            gap={{ base: '1.5', sm: '2' }}
            p={{ base: '2', sm: '2.5' }}
            bg={
                isPreferred
                    ? '#fff7cc'
                    : isFromFreezer
                      ? 'blue.50'
                      : 'whiteAlpha.700'
            }
            borderRightWidth="1px"
            borderColor={
                isPreferred ? '#f2dc72' : isFromFreezer ? 'blue.100' : '#eee8de'
            }
            cursor={recipe.id != null ? 'pointer' : 'default'}
            transition="background-color 150ms ease"
            _hover={
                recipe.id != null
                    ? {
                          bg: isPreferred
                              ? '#ffef9e'
                              : isFromFreezer
                                ? 'blue.100'
                                : '#f2eee7',
                      }
                    : undefined
            }
            _focusVisible={{
                outline: '2px solid',
                outlineColor: 'green.500',
                outlineOffset: '-2px',
            }}
            _last={{ borderRightWidth: '0' }}
        >
            <Flex
                width={{ base: '38px', sm: '46px' }}
                height={{ base: '38px', sm: '46px' }}
                align="center"
                justify="center"
                overflow="hidden"
                color="#9b6639"
                bgGradient="to-br"
                gradientFrom="#fae3b5"
                gradientTo="#e6bc7c"
                borderRadius="full"
                flexShrink="0"
            >
                {image ? (
                    <Image
                        src={image}
                        alt=""
                        width="full"
                        height="full"
                        objectFit="cover"
                    />
                ) : (
                    <Icon
                        as={PiBowlFood}
                        boxSize={{ base: '6', sm: '7' }}
                        aria-hidden="true"
                    />
                )}
            </Flex>
            <Grid
                minW="0"
                alignSelf="stretch"
                gridTemplateRows="auto 1fr"
                gap="1"
            >
                <Flex
                    minH="6"
                    align="flex-start"
                    justify="flex-end"
                    gap="1"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                >
                    {isPreferred ? (
                        <Flex
                            width="6"
                            height="6"
                            align="center"
                            justify="center"
                            color="#8a6700"
                            bg="#ffe88b"
                            borderRadius="full"
                            title="Receta prioritaria"
                            aria-label="Receta prioritaria"
                        >
                            <Icon
                                as={PiStarFill}
                                boxSize="3.5"
                                aria-hidden="true"
                            />
                        </Flex>
                    ) : null}
                    {isFromFreezer ? (
                        <Flex
                            width="6"
                            height="6"
                            align="center"
                            justify="center"
                            color="blue.700"
                            bg="blue.100"
                            borderRadius="full"
                            title="Receta del congelador"
                            aria-label="Receta del congelador"
                        >
                            <Icon
                                as={PiSnowflake}
                                boxSize="3.5"
                                aria-hidden="true"
                            />
                        </Flex>
                    ) : null}
                    <RecipeScoreBreakdown
                        score={recipe.score}
                        breakdown={recipe.breakdown}
                    />
                </Flex>
                <Heading
                    as="h3"
                    alignSelf="center"
                    fontSize={{ base: '2xs', sm: 'xs' }}
                    lineHeight="1.3"
                    color="#30312c"
                >
                    {recipe.name ?? 'Receta por confirmar'}
                </Heading>
            </Grid>
            {canChange && (
                <Button
                    type="button"
                    gridColumn="1 / -1"
                    size="xs"
                    variant="outline"
                    onClick={(event) => {
                        event.stopPropagation()
                        setIsChanging((current) => !current)
                    }}
                    onKeyDown={(event) => event.stopPropagation()}
                >
                    {isChanging ? 'Cancelar cambio' : 'Cambiar receta'}
                </Button>
            )}
            {isChanging && canChange && (
                <Grid
                    gridColumn="1 / -1"
                    gap="1"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                >
                    <MultiSelectField
                        isMulti={false}
                        instanceId={`recipe-${item.date}-${item.meal_type}`}
                        inputId={`recipe-${item.date}-${item.meal_type}`}
                        aria-label={`Sustituir receta de ${item.date} ${item.meal_type}`}
                        placeholder="Buscar otra receta…"
                        isLoading={recipesQuery.isFetching}
                        options={(recipesQuery.data ?? [])
                            .filter(
                                (entry) =>
                                    entry.is_active !== false &&
                                    (!entry.meal_type ||
                                        entry.meal_type === item.meal_type),
                            )
                            .map((entry) => ({
                                value: entry.id,
                                label: entry.name,
                                recipe: entry,
                            }))}
                        value={null}
                        onChange={(option) => {
                            if (option) {
                                onChangeRecipe(option.recipe)
                                setIsChanging(false)
                            }
                        }}
                    />
                    {recipesQuery.isError && (
                        <Text role="alert" color="red.600" fontSize="xs">
                            No se pudieron cargar las recetas.
                            <Button
                                type="button"
                                size="xs"
                                variant="plain"
                                onClick={() => recipesQuery.refetch()}
                            >
                                Reintentar
                            </Button>
                        </Text>
                    )}
                </Grid>
            )}
        </Grid>
    )
}

export default RecipeItem
