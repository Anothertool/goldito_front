import { createCrudApi } from './baseApi'

export const ingredientsApi = createCrudApi('/api/ingredients/', 'ingredients')
