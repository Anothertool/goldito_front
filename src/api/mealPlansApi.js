import { createCrudApi } from './baseApi'
import apiClient from './apiClient'

const crudApi = createCrudApi('/api/meal-plans/', 'meal-plans')

const rules = async (config = {}) => {
    const response = await apiClient.get('/api/meal-plans/rules/', config)
    return response.data
}

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
    rules,
    queries: {
        ...crudApi.queries,
        rules: () => ({
            queryKey: [...crudApi.keys.all, 'rules'],
            queryFn: ({ signal }) => rules({ signal }),
        }),
    },
    generate,
    mutations: {
        ...crudApi.mutations,
        generate: () => ({ mutationFn: generate }),
    },
}
