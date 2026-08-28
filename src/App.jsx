import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MobileLayout from '@/layouts/MobileLayout'
import Home from '@/pages/Home/Home'
import Recetas from '@/pages/Recetas/Recetas'
import FoodComponents from '@/pages/FoodComponents/FoodComponents'
import Freezer from '@/pages/Freezer/Freezer'
import Planner from '@/pages/Planner/Planner'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/recetas" element={<Recetas />} />
          <Route path="/componentes" element={<FoodComponents />} />
          <Route path="/freezer" element={<Freezer />} />
          <Route path="/planificador" element={<Planner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
