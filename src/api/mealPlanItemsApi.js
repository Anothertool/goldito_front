import { createCrudApi } from './baseApi'

export const mealPlanItemsApi = createCrudApi(
  '/api/meal-plan-items/',
  'meal-plan-items',
)
