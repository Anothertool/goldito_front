import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MobileLayout from '@/layouts/MobileLayout'
import Home from '@/pages/Home/Home'
import Recetas from '@/pages/Recetas/Recetas'
import FoodComponents from '@/pages/FoodComponents/FoodComponents'
import Storage from '@/pages/Storage/Storage'
import Planner from '@/pages/Planner/Planner'
import RecipeForm from '@/components/Recetas/RecipeForm'
import StorageForm from '@/components/Storage/StorageForm'
import FoodComponentForm from '@/components/FoodComponents/FoodComponentForm'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/recetas" element={<Recetas />} />
          <Route path="/recetas/nueva" element={<RecipeForm />} />
          <Route path="/recetas/:recipeId/editar" element={<RecipeForm />} />
          <Route path="/componentes" element={<FoodComponents />} />
          <Route path="/componentes/nuevo" element={<FoodComponentForm />} />
          <Route path="/componentes/:componentId/editar" element={<FoodComponentForm />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/storage/nuevo" element={<StorageForm />} />
          <Route path="/storage/:storageItemId/editar" element={<StorageForm />} />
          <Route path="/planificador" element={<Planner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
