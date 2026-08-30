import { Flex, Grid, Heading, Icon, Image } from '@chakra-ui/react'
import { PiBowlFood, PiSnowflake } from 'react-icons/pi'
import RecipeScoreBreakdown from '../RecipeScoreBreakdown'

function RecipeItem({ item, onOpen }) {
    const recipe = item.recipe ?? {}
    const image = recipe.image ?? recipe.photo ?? recipe.image_url
    const isFromFreezer = Boolean(recipe.is_from_freezer)

    const openRecipe = () => {
        if (recipe.id != null) onOpen(recipe.id)
    }

    return (
        <Grid
            as="article"
            role={recipe.id != null ? 'link' : undefined}
            tabIndex={recipe.id != null ? 0 : undefined}
            aria-label={
                recipe.id != null
                    ? `Editar ${recipe.name ?? 'receta'}`
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
            bg={isFromFreezer ? 'blue.50' : 'whiteAlpha.700'}
            borderRightWidth="1px"
            borderColor={isFromFreezer ? 'blue.100' : '#eee8de'}
            cursor={recipe.id != null ? 'pointer' : 'default'}
            transition="background-color 150ms ease"
            _hover={
                recipe.id != null
                    ? { bg: isFromFreezer ? 'blue.100' : '#f2eee7' }
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
        </Grid>
    )
}

export default RecipeItem
