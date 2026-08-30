import { useState } from 'react'
import { Box, Button, Flex, Grid, Icon, Stack, Text } from '@chakra-ui/react'
import { PiCaretDown, PiClock, PiCookingPot, PiForkKnife } from 'react-icons/pi'
import { itemMinutes, itemName } from './formatters'

function TimeDetail({ title, icon, minutes, items }) {
    return (
        <Box p="2.5" bg="#f7f3ec" borderRadius="lg">
            <Flex
                align="center"
                gap="1.5"
                color="#5d5a53"
                fontSize="2xs"
                fontWeight="700"
            >
                <Icon as={icon} boxSize="3.5" />
                {title}
            </Flex>
            <Text mt="1" fontSize="md" fontWeight="800">
                {minutes ?? 0} min
            </Text>
            {Array.isArray(items) && items.length > 0 ? (
                <Stack as="ul" mt="2" gap="1" listStyleType="none">
                    {items.map((item, index) => (
                        <Flex
                            as="li"
                            key={
                                item?.id ??
                                `${itemName(item, 'tiempo')}-${index}`
                            }
                            justify="space-between"
                            gap="2"
                            color="#777169"
                            fontSize="2xs"
                        >
                            <Text>
                                {itemName(item, `Elemento ${index + 1}`)}
                            </Text>
                            {itemMinutes(item) != null ? (
                                <Text flexShrink="0">
                                    {itemMinutes(item)} min
                                </Text>
                            ) : null}
                        </Flex>
                    ))}
                </Stack>
            ) : null}
        </Box>
    )
}

function CookingTime({ data = {} }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Box
            as="section"
            mb="3.5"
            bg="rgba(255, 253, 249, 0.9)"
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
                aria-expanded={isOpen}
                aria-controls="meal-plan-cooking-time"
                onClick={() => setIsOpen((value) => !value)}
                _hover={{ bg: '#f2eee7' }}
            >
                <Flex align="center" gap="1.5" fontSize="xs" fontWeight="800">
                    <Icon as={PiClock} boxSize="4.5" color="orange.600" />
                    Tiempo de cocina
                </Flex>
                <Flex align="center" gap="2">
                    <Text fontSize="sm" fontWeight="900" color="#7a4d25">
                        {data.total_minutes ?? 0} min
                    </Text>
                    <Icon
                        as={PiCaretDown}
                        boxSize="4"
                        transform={isOpen ? 'rotate(180deg)' : undefined}
                        transition="transform 150ms ease"
                    />
                </Flex>
            </Button>
            {isOpen ? (
                <Grid
                    id="meal-plan-cooking-time"
                    gridTemplateColumns="1fr 1fr"
                    gap="2"
                    px="3.5"
                    pb="3.5"
                    pt="3"
                    borderTopWidth="1px"
                    borderColor="#eee8de"
                >
                    <TimeDetail
                        title="Preparaciones"
                        icon={PiCookingPot}
                        minutes={data.components_minutes}
                        items={data.components}
                    />
                    <TimeDetail
                        title="Recetas"
                        icon={PiForkKnife}
                        minutes={data.recipes_minutes}
                        items={data.recipes}
                    />
                </Grid>
            ) : null}
        </Box>
    )
}

export default CookingTime
