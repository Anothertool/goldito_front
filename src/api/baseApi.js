import { mutationOptions, queryOptions } from '@tanstack/react-query'
import apiClient from './apiClient'
import queryClient from './queryClient'

const normalizeEndpoint = (endpoint) =>
  `/${endpoint.replace(/^\/+|\/+$/g, '')}/`

export function createCrudApi(endpoint, resourceName) {
  const resourceEndpoint = normalizeEndpoint(endpoint)
  const queryKey = resourceName || resourceEndpoint

  const itemEndpoint = (id) =>
    `${resourceEndpoint}${encodeURIComponent(id)}/`

  const api = {
    list: async (params, config = {}) => {
      const response = await apiClient.get(resourceEndpoint, {
        ...config,
        params,
      })
      return response.data
    },

    get: async (id, config = {}) => {
      const response = await apiClient.get(itemEndpoint(id), config)
      return response.data
    },

    create: async (data, config = {}) => {
      const response = await apiClient.post(resourceEndpoint, data, config)
      return response.data
    },

    update: async (id, data, config = {}) => {
      const response = await apiClient.put(itemEndpoint(id), data, config)
      return response.data
    },

    partialUpdate: async (id, data, config = {}) => {
      const response = await apiClient.patch(itemEndpoint(id), data, config)
      return response.data
    },

    remove: async (id, config = {}) => {
      const response = await apiClient.delete(itemEndpoint(id), config)
      return response.data
    },
  }

  api.delete = api.remove

  const keys = {
    all: [queryKey],
    lists: () => [queryKey, 'list'],
    list: (params = {}) => [queryKey, 'list', params],
    details: () => [queryKey, 'detail'],
    detail: (id) => [queryKey, 'detail', id],
  }

  return {
    ...api,
    endpoint: resourceEndpoint,
    keys,
    queries: {
      list: (params = {}) =>
        queryOptions({
          queryKey: keys.list(params),
          queryFn: ({ signal }) => api.list(params, { signal }),
        }),
      detail: (id) =>
        queryOptions({
          queryKey: keys.detail(id),
          queryFn: ({ signal }) => api.get(id, { signal }),
          enabled: id !== undefined && id !== null,
        }),
    },
    mutations: {
      create: () =>
        mutationOptions({
          mutationFn: (data) => api.create(data),
          onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: keys.lists() }),
        }),
      update: () =>
        mutationOptions({
          mutationFn: ({ id, data }) => api.update(id, data),
          onSuccess: (data, { id }) => {
            queryClient.setQueryData(keys.detail(id), data)
            queryClient.invalidateQueries({ queryKey: keys.lists() })
          },
        }),
      partialUpdate: () =>
        mutationOptions({
          mutationFn: ({ id, data }) => api.partialUpdate(id, data),
          onSuccess: (data, { id }) => {
            queryClient.setQueryData(keys.detail(id), data)
            queryClient.invalidateQueries({ queryKey: keys.lists() })
          },
        }),
      remove: () =>
        mutationOptions({
          mutationFn: (id) => api.remove(id),
          onSuccess: (_data, id) => {
            queryClient.removeQueries({ queryKey: keys.detail(id) })
            queryClient.invalidateQueries({ queryKey: keys.lists() })
          },
        }),
      delete: () =>
        mutationOptions({
          mutationFn: (id) => api.delete(id),
          onSuccess: (_data, id) => {
            queryClient.removeQueries({ queryKey: keys.detail(id) })
            queryClient.invalidateQueries({ queryKey: keys.lists() })
          },
        }),
    },
  }
}
