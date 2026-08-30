import { Box, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import { itemAmount, itemName } from './formatters'

function PlanSection({ icon, iconColor, title, items, emptyText }) {
    return (
        <Box
            as="section"
            mt="3"
            p="3.5"
            bg="rgba(255, 253, 249, 0.84)"
            borderWidth="1px"
            borderColor="#e7e0d5"
            borderRadius="xl"
        >
            <Flex
                as="h2"
                mb="2.5"
                align="center"
                gap="1.5"
                fontSize="xs"
                fontWeight="800"
            >
                <Icon
                    as={icon}
                    boxSize="4.5"
                    color={iconColor}
                    aria-hidden="true"
                />
                {title}
            </Flex>
            {Array.isArray(items) && items.length > 0 ? (
                <Stack as="ul" gap="2" listStyleType="none">
                    {items.map((item, index) => {
                        const amount = itemAmount(item)
                        return (
                            <Flex
                                as="li"
                                key={`${item?.recipe?.id ?? item?.recipe_id ?? item?.id ?? itemName(item, 'item')}-${index}`}
                                justify="space-between"
                                gap="3"
                                color="#656159"
                                fontSize="2xs"
                            >
                                <Text>
                                    {itemName(item, `Elemento ${index + 1}`)}
                                </Text>
                                {amount ? (
                                    <Text
                                        as="strong"
                                        flexShrink="0"
                                        fontWeight="800"
                                    >
                                        {amount}
                                    </Text>
                                ) : null}
                            </Flex>
                        )
                    })}
                </Stack>
            ) : (
                <Text color="#8a857c" fontSize="2xs">
                    {emptyText}
                </Text>
            )}
        </Box>
    )
}

export default PlanSection
