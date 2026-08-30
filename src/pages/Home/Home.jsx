import { Link as RouterLink } from 'react-router-dom'
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import {
  PiBookOpenFill,
  PiCookingPotFill,
  PiSnowflakeFill,
  PiCalendarBlankFill,
  PiCaretRightBold,
} from 'react-icons/pi'

const MENU_CARDS = [
  {
    to: '/recetas',
    icon: PiBookOpenFill,
    title: 'Recetas',
    subtitle: 'Ver y gestionar tus recetas',
    bg: '#e7f3dd',
    color: '#7ba05b',
  },
  {
    to: '/componentes',
    icon: PiCookingPotFill,
    title: 'Componentes',
    subtitle: 'Preparaciones reutilizables',
    bg: '#fdf1d3',
    color: '#e0a83e',
  },
  {
    to: '/storage',
    icon: PiSnowflakeFill,
    title: 'Storage',
    subtitle: 'Gestiona lo que tienes congelado',
    bg: '#dbeef5',
    color: '#5aa9c2',
  },
  {
    to: '/planificador',
    icon: PiCalendarBlankFill,
    title: 'Planificar menú',
    subtitle: 'Crea tu menú semanal',
    bg: '#fbdfe0',
    color: '#e07a7a',
  },
]

const SUMMARY = [
  { label: 'Recetas', value: 0 },
  { label: 'Componentes', value: 0 },
  { label: 'Raciones en storage', value: 0 },
]

function Home() {
  return (
    <Box px="6" py="8">
      <VStack gap="1" mb="6">
        <Heading size="lg" color="#3a3630">
          🧑‍🍳 Goldito
        </Heading>
        <Text color="#a39c8f">Planifica. Cocina. Disfruta.</Text>
      </VStack>

      <VStack gap="4" mb="8">
        {MENU_CARDS.map(({ to, icon: Icon, title, subtitle, bg, color }) => (
          <RouterLink key={to} to={to} style={{ width: '100%' }}>
            <HStack
              bg={bg}
              borderRadius="2xl"
              p="4"
              gap="4"
              justify="space-between"
              _active={{ transform: 'scale(0.98)' }}
            >
              <HStack gap="4">
                <Box color={color} fontSize="28px">
                  <Icon />
                </Box>
                <VStack align="start" gap="0">
                  <Text fontWeight="bold" color="#3a3630">
                    {title}
                  </Text>
                  <Text fontSize="sm" color="#7d766a">
                    {subtitle}
                  </Text>
                </VStack>
              </HStack>
              <Box color="#c9c2b5">
                <PiCaretRightBold />
              </Box>
            </HStack>
          </RouterLink>
        ))}
      </VStack>

      <Text fontWeight="bold" color="#3a3630" mb="3">
        Resumen rápido
      </Text>
      <HStack gap="3">
        {SUMMARY.map(({ label, value }) => (
          <VStack
            key={label}
            flex="1"
            bg="white"
            borderRadius="xl"
            border="1px solid #eee"
            p="3"
            gap="1"
          >
            <Text fontWeight="bold" fontSize="xl" color="#3a3630">
              {value}
            </Text>
            <Text fontSize="xs" color="#a39c8f" textAlign="center">
              {label}
            </Text>
          </VStack>
        ))}
      </HStack>
    </Box>
  )
}

export default Home
