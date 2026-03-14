// src/lib/api/digital.ts
import api from './client'
import type { ApiSuccess, ApiMessage, ApiCursorList } from './types'
import type {
  DigitalProduct, CreateDigitalProductRequest, UpdateDigitalProductRequest, DigitalProductListParams,
} from './types'

export const createDigitalProduct = (data: CreateDigitalProductRequest) =>
  api.post<ApiSuccess<DigitalProduct>>('/digital-products', data).then((r) => r.data.data)

export const listDigitalProducts = (params?: DigitalProductListParams) =>
  api.get<ApiCursorList<DigitalProduct>>('/digital-products', { params }).then((r) => r.data)

export const getDigitalProduct = (id: string) =>
  api.get<ApiSuccess<DigitalProduct>>(`/digital-products/${id}`).then((r) => r.data.data)

export const updateDigitalProduct = (id: string, data: UpdateDigitalProductRequest) =>
  api.patch<ApiSuccess<DigitalProduct>>(`/digital-products/${id}`, data).then((r) => r.data.data)

export const deleteDigitalProduct = (id: string) =>
  api.delete<ApiMessage>(`/digital-products/${id}`).then(() => undefined)

export const uploadDigitalFile = (id: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post<ApiMessage>(`/digital-products/${id}/file`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(() => undefined)
}

export const uploadDigitalCover = (id: string, file: File) => {
  const form = new FormData()
  form.append('cover', file)
  return api
    .post<ApiSuccess<{ cover_image_url: string }>>(`/digital-products/${id}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)
}
