import { NavLink } from 'react-router-dom'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import {
    PiHouseFill,
    PiHouse,
    PiBookOpenFill,
    PiBookOpen,
    PiSnowflakeFill,
    PiSnowflake,
    PiCalendarBlankFill,
    PiCalendarBlank,
    PiDotsThreeCircleFill,
    PiDotsThreeCircle,
} from 'react-icons/pi'

const NAV_ITEMS = [
    {
        to: '/',
        label: 'Inicio',
        icon: PiHouse,
        activeIcon: PiHouseFill,
        end: true,
    },
    {
        to: '/recetas',
        label: 'Recetas',
        icon: PiBookOpen,
        activeIcon: PiBookOpenFill,
    },
    {
        to: '/componentes',
        label: 'Comps',
        icon: PiDotsThreeCircle,
        activeIcon: PiDotsThreeCircleFill,
    },
    {
        to: '/storage',
        label: 'Storage',
        icon: PiSnowflake,
        activeIcon: PiSnowflakeFill,
    },
    {
        to: '/planificador',
        label: 'Plan',
        icon: PiCalendarBlank,
        activeIcon: PiCalendarBlankFill,
    },
]

// Bottom tab bar shown across all pages inside MobileLayout
function BottomBar() {
    return (
        <Box
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            maxW="480px"
            mx="auto"
            bg="white"
            borderTop="1px solid #eee"
            px="4"
            py="2"
            zIndex="10"
        >
            <HStack justify="space-between">
                {NAV_ITEMS.map(
                    ({
                        to,
                        label,
                        icon: Icon,
                        activeIcon: ActiveIcon,
                        end,
                    }) => (
                        <NavLink key={to} to={to} end={end} style={{ flex: 1 }}>
                            {({ isActive }) => (
                                <VStack
                                    gap="0.5"
                                    color={isActive ? '#e07a5f' : '#b0aca3'}
                                >
                                    {isActive ? (
                                        <ActiveIcon size={22} />
                                    ) : (
                                        <Icon size={22} />
                                    )}
                                    <Text
                                        fontSize="xs"
                                        fontWeight={
                                            isActive ? 'bold' : 'normal'
                                        }
                                    >
                                        {label}
                                    </Text>
                                </VStack>
                            )}
                        </NavLink>
                    ),
                )}
            </HStack>
        </Box>
    )
}

export default BottomBar
