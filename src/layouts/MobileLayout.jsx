import { Outlet, useLocation } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import BottomBar from '@/components/Navigation/BottomBar'

// Wraps every page in a fixed-width mobile frame with a bottom nav bar
function MobileLayout() {
  const { pathname } = useLocation()
  const isStandaloneForm =
    pathname === '/recetas/nueva' ||
    /^\/recetas\/[^/]+\/editar$/.test(pathname) ||
    pathname === '/freezer/nuevo' ||
    /^\/freezer\/[^/]+\/editar$/.test(pathname)

  return (
    <Box
      maxW="480px"
      minH="100dvh"
      mx="auto"
      display="flex"
      flexDirection="column"
      bg="#fdf6ec"
      position="relative"
    >
      <Box flex="1" overflowY="auto" pb={isStandaloneForm ? '0' : '88px'}>
        <Outlet />
      </Box>
      {!isStandaloneForm && <BottomBar />}
    </Box>
  )
}

export default MobileLayout
