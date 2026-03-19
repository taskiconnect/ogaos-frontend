// src/lib/api/business.ts
import api from './client'
import type { ApiSuccess, ApiMessage, ApiCursorList } from './types'
import type {
  Business, UpdateBusinessRequest,
  Store, CreateStoreRequest, UpdateStoreRequest,
  Customer, CreateCustomerRequest, UpdateCustomerRequest, CustomerListParams,
  Product, CreateProductRequest, UpdateProductRequest, AdjustStockRequest, ProductListParams,
} from './types'

// ─── Business ─────────────────────────────────────────────────────────────────

export const getBusiness = () =>
  api.get<ApiSuccess<Business>>('/business/me').then((r) => r.data.data)

export const updateBusiness = (data: UpdateBusinessRequest) =>
  api.patch<ApiSuccess<Business>>('/business/me', data).then((r) => r.data.data)

export const uploadBusinessLogo = (file: File) => {
  const form = new FormData()
  form.append('logo', file)
  return api
    .post<ApiSuccess<{ logo_url: string }>>('/business/me/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)
}

export const setBusinessVisibility = (isPublic: boolean) =>
  api.patch<ApiMessage>('/business/me/visibility', { is_public: isPublic }).then(() => undefined)

// ─── Storefront gallery ───────────────────────────────────────────────────────

// Upload one gallery image (max 3). Multipart POST.
export const addBusinessGalleryImage = (file: File) => {
  const form = new FormData()
  form.append('image', file)
  return api
    .post<ApiSuccess<Business>>('/business/me/gallery', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)
}

// Remove gallery image at zero-based index.
export const removeBusinessGalleryImage = (index: number) =>
  api.delete<ApiMessage>(`/business/me/gallery/${index}`).then(() => undefined)

// Set or clear the storefront promo video URL (link only, no upload).
// Pass empty string to clear.
export const setStorefrontVideo = (videoUrl: string) =>
  api
    .patch<ApiSuccess<Business>>('/business/me/storefront-video', { video_url: videoUrl })
    .then((r) => r.data.data)

// ─── Stores ───────────────────────────────────────────────────────────────────

export const createStore = (data: CreateStoreRequest) =>
  api.post<ApiSuccess<Store>>('/stores', data).then((r) => r.data.data)

export const listStores = () =>
  api.get<ApiSuccess<Store[]>>('/stores').then((r) => r.data.data)

export const getStore = (id: string) =>
  api.get<ApiSuccess<Store>>(`/stores/${id}`).then((r) => r.data.data)

export const updateStore = (id: string, data: UpdateStoreRequest) =>
  api.patch<ApiSuccess<Store>>(`/stores/${id}`, data).then((r) => r.data.data)

export const setDefaultStore = (id: string) =>
  api.patch<ApiMessage>(`/stores/${id}/default`).then(() => undefined)

export const deleteStore = (id: string) =>
  api.delete<ApiMessage>(`/stores/${id}`).then(() => undefined)

// ─── Customers ────────────────────────────────────────────────────────────────

export const createCustomer = (data: CreateCustomerRequest) =>
  api.post<ApiSuccess<Customer>>('/customers', data).then((r) => r.data.data)

export const listCustomers = (params?: CustomerListParams) =>
  api.get<ApiCursorList<Customer>>('/customers', { params }).then((r) => r.data)

export const getCustomer = (id: string) =>
  api.get<ApiSuccess<Customer>>(`/customers/${id}`).then((r) => r.data.data)

export const updateCustomer = (id: string, data: UpdateCustomerRequest) =>
  api.patch<ApiSuccess<Customer>>(`/customers/${id}`, data).then((r) => r.data.data)

export const deleteCustomer = (id: string) =>
  api.delete<ApiMessage>(`/customers/${id}`).then(() => undefined)

// ─── Products ─────────────────────────────────────────────────────────────────

export const createProduct = (data: CreateProductRequest) =>
  api.post<ApiSuccess<Product>>('/products', data).then((r) => r.data.data)

export const listProducts = (params?: ProductListParams) =>
  api.get<ApiCursorList<Product>>('/products', { params }).then((r) => r.data)

export const getProduct = (id: string) =>
  api.get<ApiSuccess<Product>>(`/products/${id}`).then((r) => r.data.data)

export const updateProduct = (id: string, data: UpdateProductRequest) =>
  api.patch<ApiSuccess<Product>>(`/products/${id}`, data).then((r) => r.data.data)

export const deleteProduct = (id: string) =>
  api.delete<ApiMessage>(`/products/${id}`).then(() => undefined)

export const adjustStock = (id: string, data: AdjustStockRequest) =>
  api.post<ApiSuccess<Product>>(`/products/${id}/stock`, data).then((r) => r.data.data)

export const uploadProductImage = (id: string, file: File) => {
  const form = new FormData()
  form.append('image', file)
  return api
    .post<ApiSuccess<{ image_url: string }>>(`/products/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role: string
  is_active: boolean
  joined_at: string
}

export const listStaff = () =>
  api.get<{ success: boolean; data: StaffMember[] }>('/staff').then(r => r.data.data)
