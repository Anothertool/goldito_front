import { useState } from 'react'
import { Box, Button, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import { PiCaretDown, PiShoppingCart } from 'react-icons/pi'
import { itemAmount, itemName } from './formatters'

function ShoppingList({ items }) {
    const [isOpen, setIsOpen] = useState(false)
    const list = Array.isArray(items) ? items : []

    return (
        <Box
            as="section"
            mt="3"
            bg="rgba(255, 253, 249, 0.84)"
            borderWidth="1px"
            borderColor="#e7e0d5"
            borderRadius="xl"
            overflow="hidden"
        >
            <Button
                type="button"
                width="full"
                height="auto"
                px="3.5"
                py="3"
                justifyContent="space-between"
                color="#30312c"
                bg="transparent"
                borderRadius="0"
                fontSize="xs"
                fontWeight="800"
                aria-expanded={isOpen}
                aria-controls="meal-plan-shopping-list"
                onClick={() => setIsOpen((value) => !value)}
                _hover={{ bg: '#f2eee7' }}
            >
                <Flex align="center" gap="1.5">
                    <Icon
                        as={PiShoppingCart}
                        boxSize="4.5"
                        color="orange.600"
                    />
                    Lista de la compra
                    <Text as="span" color="#8a857c" fontWeight="700">
                        ({list.length})
                    </Text>
                </Flex>
                <Icon
                    as={PiCaretDown}
                    boxSize="4"
                    transform={isOpen ? 'rotate(180deg)' : undefined}
                    transition="transform 150ms ease"
                />
            </Button>
            {isOpen ? (
                <Box
                    id="meal-plan-shopping-list"
                    px="3.5"
                    pb="3.5"
                    borderTopWidth="1px"
                    borderColor="#eee8de"
                >
                    {list.length > 0 ? (
                        <Stack as="ul" pt="3" gap="2" listStyleType="none">
                            {list.map((item, index) => (
                                <Flex
                                    as="li"
                                    key={
                                        item?.id ??
                                        `${itemName(item, 'compra')}-${index}`
                                    }
                                    justify="space-between"
                                    gap="3"
                                    color="#656159"
                                    fontSize="2xs"
                                >
                                    <Text>
                                        {itemName(
                                            item,
                                            `Producto ${index + 1}`,
                                        )}
                                    </Text>
                                    {itemAmount(item) ? (
                                        <Text
                                            as="strong"
                                            flexShrink="0"
                                            fontWeight="800"
                                        >
                                            {itemAmount(item)}
                                        </Text>
                                    ) : null}
                                </Flex>
                            ))}
                        </Stack>
                    ) : (
                        <Text pt="3" color="#8a857c" fontSize="2xs">
                            No hace falta comprar nada.
                        </Text>
                    )}
                </Box>
            ) : null}
        </Box>
    )
}

export default ShoppingList
