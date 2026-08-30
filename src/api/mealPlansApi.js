import { createCrudApi } from './baseApi'
import apiClient from './apiClient'

const crudApi = createCrudApi('/api/meal-plans/', 'meal-plans')

const generate = async (data, config = {}) => {
    const response = await apiClient.post(
        '/api/meal-plans/generate/',
        data,
        config,
    )
    return response.data
}

export const mealPlansApi = {
    ...crudApi,
    generate,
    mutations: {
        ...crudApi.mutations,
        generate: () => ({ mutationFn: generate }),
    },
}
