import {
    Badge,
    Box,
    Button,
    CloseButton,
    Dialog,
    Flex,
    Heading,
    Image,
    List,
    Portal,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { PiBowlFood, PiClock, PiUsers } from 'react-icons/pi'
import { recipesApi } from '@/api'

export default function RecipeDetailModal({ recipe, onClose }) {
    const query = useQuery(recipesApi.queries.detail(recipe?.id))
    const detail = query.data ?? recipe
    const image = detail?.image_url || detail?.image || detail?.photo
    const steps = (detail?.instructions ?? '')
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter(Boolean)
    return (
        <Dialog.Root
            open={Boolean(recipe)}
            onOpenChange={({ open }) => {
                if (!open) onClose()
            }}
            size="full"
            scrollBehavior="inside"
            lazyMount
            unmountOnExit
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content
                        bg="#fdf8ef"
                        color="#302d28"
                        h="100dvh"
                        borderRadius="0"
                    >
                        <Dialog.CloseTrigger
                            asChild
                            position="absolute"
                            top="4"
                            right="4"
                            zIndex="2"
                        >
                            <CloseButton
                                aria-label="Cerrar detalle de receta"
                                bg="white"
                                borderRadius="full"
                                boxShadow="md"
                            />
                        </Dialog.CloseTrigger>
                        <Dialog.Body p="0">
                            <Flex
                                h={{ base: '32dvh', md: '45dvh' }}
                                minH="220px"
                                bg="#ffe8bf"
                                color="#b6713e"
                                align="center"
                                justify="center"
                                fontSize="80px"
                            >
                                {image ? (
                                    <Image
                                        src={image}
                                        alt={detail?.name ?? ''}
                                        w="full"
                                        h="full"
                                        objectFit="cover"
                                    />
                                ) : (
                                    <PiBowlFood aria-hidden="true" />
                                )}
                            </Flex>
                            <Stack
                                maxW="850px"
                                mx="auto"
                                p={{ base: '5', md: '8' }}
                                gap="6"
                            >
                                <Box>
                                    <Dialog.Title
                                        fontSize={{ base: '2xl', md: '3xl' }}
                                        mb="3"
                                    >
                                        {detail?.name}
                                    </Dialog.Title>
                                    {detail?.description && (
                                        <Dialog.Description
                                            color="#777168"
                                            whiteSpace="pre-wrap"
                                        >
                                            {detail.description}
                                        </Dialog.Description>
                                    )}
                                    <Flex
                                        wrap="wrap"
                                        gap="4"
                                        mt="4"
                                        color="#777168"
                                    >
                                        <Flex align="center" gap="2">
                                            <PiUsers /> {detail?.servings ?? 2}{' '}
                                            raciones
                                        </Flex>
                                        {detail?.active_time_minutes !=
                                            null && (
                                            <Flex align="center" gap="2">
                                                <PiClock />{' '}
                                                {detail.active_time_minutes} min
                                                activos
                                            </Flex>
                                        )}
                                    </Flex>
                                    <Flex wrap="wrap" gap="2" mt="3">
                                        {detail?.meal_type && (
                                            <Badge colorPalette="green">
                                                {detail.meal_type === 'lunch'
                                                    ? 'Comida'
                                                    : detail.meal_type ===
                                                        'dinner'
                                                      ? 'Cena'
                                                      : detail.meal_type}
                                            </Badge>
                                        )}
                                        {(detail?.tags ?? []).map((tag) => (
                                            <Badge key={tag.id ?? tag}>
                                                {tag.name ?? tag}
                                            </Badge>
                                        ))}
                                        {detail?.is_active === false && (
                                            <Badge>Inactiva</Badge>
                                        )}
                                    </Flex>
                                </Box>
                                {query.isPending && (
                                    <Flex role="status" gap="3" align="center">
                                        <Spinner size="sm" /> Cargando detalles…
                                    </Flex>
                                )}
                                {query.isError && (
                                    <Stack role="alert">
                                        <Text>
                                            No hemos podido cargar los detalles
                                            de la receta.
                                        </Text>
                                        <Button
                                            alignSelf="start"
                                            onClick={() => query.refetch()}
                                        >
                                            Volver a intentar
                                        </Button>
                                    </Stack>
                                )}
                                {query.isSuccess && (
                                    <>
                                        <Box>
                                            <Heading as="h3" size="lg" mb="4">
                                                Preparación
                                            </Heading>
                                            {steps.length ? (
                                                <List.Root
                                                    as="ol"
                                                    listStyleType="decimal"
                                                    gap="3"
                                                    ps="6"
                                                >
                                                    {steps.map(
                                                        (step, index) => (
                                                            <List.Item
                                                                key={index}
                                                                ps="2"
                                                                whiteSpace="pre-wrap"
                                                                overflowWrap="anywhere"
                                                            >
                                                                {step}
                                                            </List.Item>
                                                        ),
                                                    )}
                                                </List.Root>
                                            ) : (
                                                <Text color="#777168">
                                                    No hay instrucciones de
                                                    preparación.
                                                </Text>
                                            )}
                                        </Box>
                                        <Box>
                                            <Heading as="h3" size="lg" mb="4">
                                                Ingredientes
                                            </Heading>
                                            {detail.ingredients?.length ? (
                                                <List.Root
                                                    listStyleType="none"
                                                    gap="2"
                                                >
                                                    {detail.ingredients.map(
                                                        (item, index) => (
                                                            <List.Item
                                                                key={
                                                                    item.id ??
                                                                    index
                                                                }
                                                                p="4"
                                                                bg="#fffdf9"
                                                                border="1px solid #e7dfd3"
                                                                borderRadius="12px"
                                                            >
                                                                <Flex
                                                                    justify="space-between"
                                                                    gap="4"
                                                                    wrap="wrap"
                                                                >
                                                                    <Text fontWeight="600">
                                                                        {item.name ||
                                                                            item
                                                                                .ingredient
                                                                                ?.name ||
                                                                            item.ingredient_name ||
                                                                            'Ingrediente'}
                                                                    </Text>
                                                                    <Text color="#777168">
                                                                        {[
                                                                            item.quantity,
                                                                            item.unit,
                                                                        ]
                                                                            .filter(
                                                                                (
                                                                                    value,
                                                                                ) =>
                                                                                    value !=
                                                                                        null &&
                                                                                    value !==
                                                                                        '',
                                                                            )
                                                                            .join(
                                                                                ' ',
                                                                            ) ||
                                                                            'Cantidad no indicada'}
                                                                    </Text>
                                                                </Flex>
                                                            </List.Item>
                                                        ),
                                                    )}
                                                </List.Root>
                                            ) : (
                                                <Text color="#777168">
                                                    No hay ingredientes
                                                    registrados.
                                                </Text>
                                            )}
                                        </Box>
                                        {detail.components?.length > 0 && (
                                            <Box>
                                                <Heading
                                                    as="h3"
                                                    size="lg"
                                                    mb="4"
                                                >
                                                    Componentes de la receta
                                                </Heading>
                                                <List.Root
                                                    listStyleType="none"
                                                    gap="2"
                                                >
                                                    {detail.components.map(
                                                        (item, index) => (
                                                            <List.Item
                                                                key={
                                                                    item.id ??
                                                                    index
                                                                }
                                                                p="4"
                                                                bg="#fffdf9"
                                                                border="1px solid #e7dfd3"
                                                                borderRadius="12px"
                                                            >
                                                                <Flex
                                                                    justify="space-between"
                                                                    gap="4"
                                                                    wrap="wrap"
                                                                >
                                                                    <Text fontWeight="600">
                                                                        {item
                                                                            .component
                                                                            ?.name ||
                                                                            item.component_name ||
                                                                            item.name ||
                                                                            `Componente ${item.component_id ?? index + 1}`}
                                                                    </Text>
                                                                    <Text color="#777168">
                                                                        {item.portions ??
                                                                            1}{' '}
                                                                        porciones
                                                                    </Text>
                                                                </Flex>
                                                            </List.Item>
                                                        ),
                                                    )}
                                                </List.Root>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Stack>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
