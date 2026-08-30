import { queryOptions } from '@tanstack/react-query'
import apiClient from './apiClient'
import { createCrudApi } from './baseApi'

const crudApi = createCrudApi('/api/ingredients/', 'ingredients')

const search = async (query, config = {}) => {
  const response = await apiClient.get('/api/ingredients/search/', {
    ...config,
    params: { q: query },
  })
  return response.data
}

export const ingredientsApi = {
  ...crudApi,
  search,
  keys: {
    ...crudApi.keys,
    search: (query) => ['ingredients', 'search', query],
  },
  queries: {
    ...crudApi.queries,
    search: (query) =>
      queryOptions({
        queryKey: ['ingredients', 'search', query],
        queryFn: ({ signal }) => search(query, { signal }),
        enabled: query.length >= 3,
        staleTime: 60_000,
      }),
  },
}
