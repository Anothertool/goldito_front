import {
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    Icon,
    IconButton,
    SimpleGrid,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import {
    PiArrowLeft,
    PiBowlFood,
    PiCalendarBlank,
    PiCookingPot,
    PiDrop,
    PiFish,
    PiLeaf,
    PiPawPrint,
    PiRepeat,
    PiSnowflake,
} from 'react-icons/pi'
import CookingTime from './meal-plan-view/CookingTime'
import { formatDate } from './meal-plan-view/formatters'
import PlanSection from './meal-plan-view/PlanSection'
import RecipeItem from './meal-plan-view/RecipeItem'
import ShoppingList from './meal-plan-view/ShoppingList'

const SUMMARY = [
    ['legume', 'Legumbres', PiLeaf],
    ['fish', 'Pescado', PiFish],
    ['red_meat', 'Carne roja', PiPawPrint],
    ['white_meat', 'Carne blanca', PiDrop],
]

function MealPlanView({ plan, isRegenerating, error, onBack, onRegenerate }) {
    const navigate = useNavigate()
    const groupedDays = (Array.isArray(plan.items) ? plan.items : []).reduce(
        (map, item) => {
            const date = item.date ?? 'Sin fecha'
            if (!map.has(date)) map.set(date, [])
            map.get(date).push(item)
            return map
        },
        new Map(),
    )

    return (
        <Box
            as="section"
            minH="full"
            px={{ base: '4', sm: '5' }}
            pt="5"
            pb="6"
            color="#30312c"
        >
            <Grid
                gridTemplateColumns="36px 1fr 36px"
                alignItems="center"
                mb="2.5"
                textAlign="center"
            >
                <IconButton
                    type="button"
                    onClick={onBack}
                    aria-label="Volver a configurar"
                    variant="ghost"
                    color="#30312c"
                    size="sm"
                >
                    <PiArrowLeft />
                </IconButton>
                <Box>
                    <Text
                        color="#8d7457"
                        fontSize="2xs"
                        fontWeight="800"
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                    >
                        Tu propuesta semanal
                    </Text>
                    <Heading
                        as="h1"
                        mt="0.5"
                        fontSize="xl"
                        lineHeight="1.1"
                        letterSpacing="-0.035em"
                    >
                        Sugerencia de menú
                    </Heading>
                </Box>
            </Grid>

            <Flex
                width="fit-content"
                mx="auto"
                mb="3.5"
                px="3"
                py="1.5"
                align="center"
                gap="2"
                color="#6d695f"
                bg="#eee9df"
                borderRadius="full"
                fontSize="2xs"
                fontWeight="700"
            >
                <Icon as={PiCalendarBlank} boxSize="3.5" color="green.700" />
                {formatDate(plan.start_date, {
                    day: 'numeric',
                    month: 'short',
                })}
                <Text as="span">—</Text>
                {formatDate(plan.end_date, { day: 'numeric', month: 'short' })}
            </Flex>

            <SimpleGrid
                as="section"
                aria-label="Resumen del menú"
                columns={4}
                mb="3.5"
                px="1.5"
                py="2.5"
                bg="rgba(255, 253, 249, 0.84)"
                borderWidth="1px"
                borderColor="#e7e0d5"
                borderRadius="xl"
            >
                {SUMMARY.map(([key, label, SummaryIcon], index) => (
                    <Grid
                        key={key}
                        justifyItems="center"
                        gap="0.5"
                        borderRightWidth={
                            index < SUMMARY.length - 1 ? '1px' : '0'
                        }
                        borderColor="#ece6dc"
                    >
                        <Icon as={SummaryIcon} boxSize="4" color="#b77b45" />
                        <Text
                            as="strong"
                            fontSize="sm"
                            lineHeight="1.2"
                            fontWeight="800"
                        >
                            {plan.summary?.[key] ?? 0}
                        </Text>
                        <Text color="#8a857c" fontSize="2xs">
                            {label}
                        </Text>
                    </Grid>
                ))}
            </SimpleGrid>

            <CookingTime data={plan.cooking_time} />

            {groupedDays.size ? (
                <Stack gap="2.5">
                    {[...groupedDays].map(([date, items]) => (
                        <Box
                            as="section"
                            key={date}
                            overflow="hidden"
                            bg="#fffdf9"
                            borderWidth="1px"
                            borderColor="#e7e0d5"
                            borderRadius="xl"
                            boxShadow="0 4px 12px rgba(76, 60, 37, 0.04)"
                        >
                            <Flex
                                as="header"
                                px="3"
                                py="2"
                                align="center"
                                justify="space-between"
                                bg="#eef3e9"
                            >
                                <Text
                                    as="strong"
                                    fontSize="2xs"
                                    fontWeight="800"
                                    textTransform="capitalize"
                                >
                                    {formatDate(date, { weekday: 'long' })}
                                </Text>
                                <Text color="#838078" fontSize="2xs">
                                    {formatDate(date, {
                                        day: 'numeric',
                                        month: 'long',
                                    })}
                                </Text>
                            </Flex>
                            <SimpleGrid columns={items.length || 1}>
                                {items.map((item, index) => (
                                    <RecipeItem
                                        key={`${item.meal_type ?? 'meal'}-${item.recipe?.id ?? index}`}
                                        item={item}
                                        onOpen={(recipeId) =>
                                            navigate(
                                                `/recetas/${recipeId}/editar`,
                                            )
                                        }
                                    />
                                ))}
                            </SimpleGrid>
                        </Box>
                    ))}
                </Stack>
            ) : (
                <Box
                    py="8"
                    px="4"
                    textAlign="center"
                    color="#77756e"
                    bg="#fffdf9"
                    borderWidth="1px"
                    borderColor="#e7e0d5"
                    borderRadius="xl"
                >
                    <Icon as={PiBowlFood} boxSize="10" color="#b18456" />
                    <Heading as="h2" mt="1.5" fontSize="sm" color="#30312c">
                        El menú no contiene platos
                    </Heading>
                    <Text mt="0.5" fontSize="2xs">
                        Prueba a regenerarlo.
                    </Text>
                </Box>
            )}

            <PlanSection
                icon={PiSnowflake}
                iconColor="blue.600"
                title="Uso del almacenamiento"
                items={plan.storage_usage}
                emptyText="No se utilizará nada del almacenamiento."
            />
            <PlanSection
                icon={PiCookingPot}
                iconColor="orange.600"
                title="Componentes para preparar"
                items={plan.components_to_prepare}
                emptyText="No hay componentes adicionales que preparar."
            />
            <ShoppingList items={plan.shopping_list} />

            {error ? (
                <Box
                    role="alert"
                    mt="3"
                    px="3"
                    py="2.5"
                    color="#98433d"
                    bg="#fff0ec"
                    borderWidth="1px"
                    borderColor="#efc9c1"
                    borderRadius="lg"
                    fontSize="2xs"
                >
                    No hemos podido regenerar el menú. El menú anterior sigue
                    disponible.
                </Box>
            ) : null}
            <Grid gridTemplateColumns="0.8fr 1.2fr" gap="2" mt="3.5">
                <Button
                    type="button"
                    height="12"
                    onClick={onBack}
                    color="green.800"
                    bg="transparent"
                    borderWidth="1px"
                    borderColor="green.300"
                    borderRadius="xl"
                    fontSize="xs"
                    fontWeight="800"
                    _hover={{ bg: 'green.50' }}
                >
                    Ajustar fechas
                </Button>
                <Button
                    type="button"
                    height="12"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    color="white"
                    bg="green.700"
                    borderRadius="xl"
                    boxShadow="0 7px 18px rgba(38, 101, 59, 0.22)"
                    fontSize="xs"
                    fontWeight="800"
                    _hover={{ bg: 'green.800' }}
                >
                    {isRegenerating ? (
                        <Spinner size="xs" />
                    ) : (
                        <Icon as={PiRepeat} boxSize="4.5" />
                    )}
                    {isRegenerating ? 'Regenerando…' : 'Regenerar menú'}
                </Button>
            </Grid>
        </Box>
    )
}

export default MealPlanView
