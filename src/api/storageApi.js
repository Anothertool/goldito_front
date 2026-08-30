import { createCrudApi } from './baseApi'

export const storageApi = createCrudApi('/api/storage/', 'storage')
