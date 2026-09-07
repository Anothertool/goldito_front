import { Badge, Box, Button, Flex, Grid, Heading, Text } from '@chakra-ui/react'

const categories = {
    nutrition: 'Nutrición',
    storage: 'Storage',
    cooking: 'Cocina',
    variety: 'Variedad',
    priority: 'Prioridades',
    general: 'General',
}
const types = {
    hard: { label: 'Obligatoria', color: 'orange' },
    soft: { label: 'Preferencia', color: 'blue' },
}
const effects = {
    positive: { label: 'Favorece', color: 'green' },
    negative: { label: 'Penaliza', color: 'red' },
    neutral: { label: 'Neutral', color: 'gray' },
}

function RuleEntry({ entry, status, children }) {
    return (
        <Box as="li">
            <Flex align="center" gap="8px" wrap="wrap" mb="4px">
                <Text fontSize="sm" fontWeight="medium">
                    {entry.label}
                </Text>
                <Badge colorPalette={status?.color ?? 'gray'}>
                    {status?.label ?? entry.type ?? entry.effect}
                </Badge>
            </Flex>
            <Text fontSize="xs" color="#5f5c55">
                {entry.description}
            </Text>
            {children}
        </Box>
    )
}

const listStyles = { gap: '14px', listStyleType: 'none', m: 0, p: 0 }

export default function PlannerRules({ query }) {
    const {
        rules = [],
        scoring = [],
        tag_groups: tagGroups = [],
    } = query.data ?? {}
    const groupedRules = rules.reduce((groups, rule) => {
        const category = rule.category ?? 'general'
        if (!groups.has(category)) groups.set(category, [])
        groups.get(category).push(rule)
        return groups
    }, new Map())

    return (
        <Box
            as="section"
            p="14px"
            bg="#fffdf9"
            border="1px solid #e7e0d5"
            borderRadius="14px"
        >
            <Heading as="h2" fontSize="sm" mb="12px">
                Cómo crearemos tu menú
            </Heading>
            {query.isPending && (
                <Text role="status" fontSize="xs">
                    Cargando las reglas del menú…
                </Text>
            )}
            {query.isError && (
                <Box role="alert">
                    <Text fontSize="xs" color="red.600">
                        No se pudieron cargar las reglas del menú.
                    </Text>
                    <Button
                        type="button"
                        size="xs"
                        variant="plain"
                        onClick={() => query.refetch()}
                        loading={query.isFetching}
                    >
                        Reintentar
                    </Button>
                </Box>
            )}
            {query.isSuccess && (
                <Box>
                    <Text fontSize="xs" color="#5f5c55" mb="10px">
                        {rules.length} reglas · {scoring.length} criterios de
                        puntuación · {tagGroups.length} grupos de tags
                    </Text>
                    <Box as="details">
                        <Box
                            as="summary"
                            cursor="pointer"
                            fontSize="sm"
                            fontWeight="medium"
                            color="#34784a"
                            py="6px"
                            borderRadius="4px"
                            _focusVisible={{
                                outline: '2px solid',
                                outlineOffset: '3px',
                            }}
                        >
                            Ver reglas y criterios del menú
                        </Box>
                        <Grid gap="20px" mt="14px">
                            <Box>
                                <Heading as="h3" fontSize="sm" mb="12px">
                                    Reglas
                                </Heading>
                                <Grid gap="16px">
                                    {[...groupedRules].map(
                                        ([category, entries]) => (
                                            <Box key={category}>
                                                <Heading
                                                    as="h4"
                                                    fontSize="xs"
                                                    color="#34784a"
                                                    mb="9px"
                                                >
                                                    {categories[category] ??
                                                        category}
                                                </Heading>
                                                <Grid as="ul" {...listStyles}>
                                                    {entries.map((rule) => (
                                                        <RuleEntry
                                                            key={rule.key}
                                                            entry={rule}
                                                            status={
                                                                types[rule.type]
                                                            }
                                                        />
                                                    ))}
                                                </Grid>
                                            </Box>
                                        ),
                                    )}
                                    {!rules.length && (
                                        <Text fontSize="xs" color="#77756e">
                                            No hay reglas disponibles.
                                        </Text>
                                    )}
                                </Grid>
                            </Box>
                            <Box>
                                <Heading as="h3" fontSize="sm" mb="12px">
                                    Puntuaciones
                                </Heading>
                                <Grid as="ul" {...listStyles}>
                                    {scoring.map((score) => (
                                        <RuleEntry
                                            key={score.key}
                                            entry={score}
                                            status={effects[score.effect]}
                                        >
                                            <Box
                                                as="details"
                                                mt="6px"
                                                fontSize="xs"
                                                color="#5f5c55"
                                            >
                                                <Box
                                                    as="summary"
                                                    cursor="pointer"
                                                >
                                                    Ver detalle
                                                </Box>
                                                <Text mt="4px">
                                                    Peso: {score.weight}
                                                </Text>
                                            </Box>
                                        </RuleEntry>
                                    ))}
                                </Grid>
                                {!scoring.length && (
                                    <Text fontSize="xs" color="#77756e">
                                        No hay puntuaciones disponibles.
                                    </Text>
                                )}
                            </Box>
                            <Box>
                                <Heading as="h3" fontSize="sm" mb="12px">
                                    Grupos de tags
                                </Heading>
                                <Grid as="ul" {...listStyles}>
                                    {tagGroups.map((group) => (
                                        <Box as="li" key={group.key}>
                                            <Text
                                                fontSize="xs"
                                                fontWeight="medium"
                                                mb="6px"
                                            >
                                                {group.label}
                                            </Text>
                                            <Flex gap="6px" wrap="wrap">
                                                {group.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="subtle"
                                                        colorPalette="green"
                                                        borderRadius="full"
                                                        px="8px"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </Flex>
                                        </Box>
                                    ))}
                                </Grid>
                                {!tagGroups.length && (
                                    <Text fontSize="xs" color="#77756e">
                                        No hay grupos de tags disponibles.
                                    </Text>
                                )}
                            </Box>
                        </Grid>
                    </Box>
                </Box>
            )}
        </Box>
    )
}
