import { createCrudApi } from './baseApi'

export const recipesApi = createCrudApi('/api/recipes/', 'recipes')
