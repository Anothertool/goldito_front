import {
    Badge,
    Box,
    Flex,
    Popover,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react'

const SCORE_FACTORS = {
    base: {
        label: 'Base',
        description: 'Todas las recetas comienzan con 100 puntos.',
    },
    storage: {
        label: 'Almacenamiento',
        description:
            'Componente disponible: +35. Receta completa disponible: +80.',
    },
    nutrition: {
        label: 'Nutrición',
        description:
            'Legumbre necesaria: +25. Pescado necesario: +30; si es urgente: +60.',
    },
    variety: {
        label: 'Variedad',
        description:
            'Repetir receta en el plan: −70. Repetirla al día siguiente: −100.',
    },
    history: {
        label: 'Historial',
        description: 'Consumida hace 7 días: −50; hace 14: −25; hace 30: −10.',
    },
    occasional: {
        label: 'Ocasional',
        description: 'Las recetas de consumo ocasional reciben −40 puntos.',
    },
}

const formatScore = (value) =>
    new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(
        Number(value) || 0,
    )

function RecipeScoreBreakdown({ score, breakdown = {} }) {
    const factors = Object.entries(SCORE_FACTORS).map(([key, copy]) => ({
        key,
        ...copy,
        value: Number(breakdown?.[key]) || 0,
    }))

    return (
        <Popover.Root positioning={{ placement: 'bottom-end' }}>
            <Popover.Trigger asChild>
                <Badge
                    as="button"
                    type="button"
                    aria-label={`Ver desglose de la puntuación: ${formatScore(score)} puntos`}
                    cursor="pointer"
                    color="white"
                    bg="orange.500"
                    borderRadius="full"
                    px="1.5"
                    py="0.5"
                    fontSize="8px"
                    fontWeight="800"
                    lineHeight="1.1"
                    whiteSpace="nowrap"
                    _hover={{ bg: 'orange.600' }}
                    _focusVisible={{
                        outline: '2px solid',
                        outlineColor: 'orange.400',
                    }}
                >
                    {formatScore(score)} pts
                </Badge>
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    <Popover.Content
                        maxW="xs"
                        color="gray.900"
                        bg="white"
                        borderWidth="1px"
                        borderColor="gray.200"
                        borderRadius="xl"
                        boxShadow="xl"
                    >
                        <Popover.Arrow>
                            <Popover.ArrowTip
                                bg="white"
                                borderColor="gray.200"
                            />
                        </Popover.Arrow>
                        <Popover.Body p="4">
                            <Text
                                fontSize="sm"
                                fontWeight="800"
                                color="gray.800"
                            >
                                Desglose de puntuación
                            </Text>
                            <Text mt="1" mb="3" fontSize="xs" color="gray.600">
                                Estos factores explican por qué se ha elegido la
                                receta.
                            </Text>
                            <Stack gap="2.5">
                                {factors.map((factor) => (
                                    <Flex
                                        key={factor.key}
                                        align="flex-start"
                                        gap="3"
                                    >
                                        <Box flex="1">
                                            <Text
                                                fontSize="xs"
                                                fontWeight="700"
                                                color="gray.800"
                                            >
                                                {factor.label}
                                            </Text>
                                            <Text
                                                fontSize="2xs"
                                                lineHeight="1.35"
                                                color="gray.500"
                                            >
                                                {factor.description}
                                            </Text>
                                        </Box>
                                        <Text
                                            minW="12"
                                            textAlign="right"
                                            fontSize="xs"
                                            fontWeight="800"
                                            color="gray.700"
                                        >
                                            {factor.value > 0 ? '+' : ''}
                                            {formatScore(factor.value)}
                                        </Text>
                                    </Flex>
                                ))}
                            </Stack>
                            <Flex
                                mt="3"
                                pt="3"
                                justify="space-between"
                                borderTopWidth="1px"
                                borderColor="gray.200"
                            >
                                <Text fontSize="xs" fontWeight="800">
                                    Total
                                </Text>
                                <Text
                                    fontSize="xs"
                                    fontWeight="800"
                                    color="gray.900"
                                >
                                    {formatScore(score)} puntos
                                </Text>
                            </Flex>
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    )
}

export default RecipeScoreBreakdown
