import {
    Badge,
    Box,
    Flex,
    Heading,
    IconButton,
    Image,
    Menu,
    Portal,
    Text,
} from '@chakra-ui/react'
import {
    PiBowlFood,
    PiClock,
    PiDotsThreeVertical,
    PiUsers,
} from 'react-icons/pi'

export default function RecipeCard({
    recipe,
    onOpen,
    onEdit,
    onDelete,
    deleting,
}) {
    const image = recipe.image_url || recipe.image || recipe.photo
    return (
        <Flex
            as="article"
            position="relative"
            gap="2"
            p="3"
            bg="#fffdf9"
            border="1px solid #e7dfd3"
            borderRadius="14px"
            boxShadow="0 4px 14px rgb(83 61 34 / 4%)"
        >
            <Flex
                as="button"
                type="button"
                onClick={onOpen}
                aria-label={`Ver receta: ${recipe.name}`}
                flex="1"
                minW="0"
                pr="8"
                gap="3"
                textAlign="left"
                cursor="pointer"
                borderRadius="10px"
                _focusVisible={{
                    outline: '2px solid #397c3d',
                    outlineOffset: '4px',
                }}
            >
                <Flex
                    flexShrink="0"
                    w={{ base: '88px', sm: '104px' }}
                    h="104px"
                    align="center"
                    justify="center"
                    alignSelf="center"
                    overflow="hidden"
                    bg="#ffe8bf"
                    color="#b6713e"
                    borderRadius="13px"
                    fontSize="50px"
                >
                    {image ? (
                        <Image
                            src={image}
                            alt=""
                            w="full"
                            h="full"
                            objectFit="cover"
                            loading="lazy"
                        />
                    ) : (
                        <PiBowlFood aria-hidden="true" />
                    )}
                </Flex>
                <Box minW="0" py="1" flex="1">
                    <Heading as="h2" fontSize="16px" lineClamp="2" mb="1">
                        {recipe.name}
                    </Heading>
                    {recipe.description && (
                        <Text color="#777168" fontSize="12px" truncate mb="2">
                            {recipe.description}
                        </Text>
                    )}
                    <Flex wrap="wrap" gap="1" mb="2">
                        {recipe.meal_type && (
                            <Badge colorPalette="green">
                                {recipe.meal_type === 'lunch'
                                    ? 'Comida'
                                    : recipe.meal_type === 'dinner'
                                      ? 'Cena'
                                      : recipe.meal_type}
                            </Badge>
                        )}
                        {(recipe.tags ?? []).slice(0, 3).map((tag) => (
                            <Badge key={tag.id ?? tag} maxW="90px" truncate>
                                {tag.name ?? tag}
                            </Badge>
                        ))}
                    </Flex>
                    <Flex wrap="wrap" gap="2" color="#777168" fontSize="11px">
                        <Flex align="center" gap="1">
                            <PiUsers /> {recipe.servings ?? 2} raciones
                        </Flex>
                        {recipe.active_time_minutes != null && (
                            <Flex align="center" gap="1">
                                <PiClock /> {recipe.active_time_minutes} min
                            </Flex>
                        )}
                    </Flex>
                </Box>
            </Flex>
            <Menu.Root positioning={{ placement: 'bottom-end' }}>
                <Menu.Trigger asChild>
                    <IconButton
                        variant="ghost"
                        position="absolute"
                        top="2"
                        right="2"
                        color="#302d28"
                        flexShrink="0"
                        zIndex="1"
                        onClick={(event) => event.stopPropagation()}
                        size="xs"
                        aria-label={`Acciones para ${recipe.name}`}
                    >
                        <PiDotsThreeVertical />
                    </IconButton>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content>
                            <Menu.Item value="edit" onClick={onEdit}>
                                Editar
                            </Menu.Item>
                            <Menu.Item
                                value="delete"
                                color="red.600"
                                onClick={onDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Eliminando…' : 'Eliminar'}
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>
        </Flex>
    )
}
