// src/lib/api/business.ts
import api from './client'
import type { ApiSuccess, ApiMessage, ApiCursorList } from './types'
import type {
  Business, UpdateBusinessRequest, SetBusinessKeywordsRequest,
  Store, CreateStoreRequest, UpdateStoreRequest,
  Customer, CreateCustomerRequest, UpdateCustomerRequest, CustomerListParams,
  Product, CreateProductRequest, UpdateProductRequest, AdjustStockRequest, ProductListParams,
  StaffMember, InviteStaffRequest, UpdateStaffRequest, StaffListParams,
} from './types'

function handleApiError(error: any): never {
  const status = error?.response?.status
  const data = error?.response?.data

  if (status === 402 && data?.upgrade_required) {
    throw {
      type: 'subscription',
      status,
      ...data,
    }
  }

  throw {
    type: 'api',
    status,
    message: data?.message || 'Something went wrong',
  }
}

// ─── Business ─────────────────────────────────────────────────────────────────

export const getBusiness = async () => {
  try {
    const res = await api.get<ApiSuccess<Business>>('/business/me')
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const updateBusiness = async (data: UpdateBusinessRequest) => {
  try {
    const res = await api.patch<ApiSuccess<Business>>('/business/me', data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const uploadBusinessLogo = async (file: File) => {
  try {
    const form = new FormData()
    form.append('logo', file)

    const res = await api.post<ApiSuccess<{ logo_url: string }>>('/business/me/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const setBusinessVisibility = async (isPublic: boolean) => {
  try {
    await api.patch<ApiMessage>('/business/me/visibility', { is_public: isPublic })
  } catch (error) {
    handleApiError(error)
  }
}

export const getBusinessKeywords = async () => {
  try {
    const res = await api.get<ApiSuccess<{ keywords: string[] }>>('/business/me/keywords')
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const setBusinessKeywords = async (data: SetBusinessKeywordsRequest) => {
  try {
    const res = await api.put<ApiSuccess<{ keywords: string[] }>>('/business/me/keywords', data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

// ─── Storefront gallery ───────────────────────────────────────────────────────

export const addBusinessGalleryImage = async (file: File) => {
  try {
    const form = new FormData()
    form.append('image', file)

    const res = await api.post<ApiSuccess<Business>>('/business/me/gallery', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const removeBusinessGalleryImage = async (index: number) => {
  try {
    await api.delete<ApiMessage>(`/business/me/gallery/${index}`)
  } catch (error) {
    handleApiError(error)
  }
}

export const setStorefrontVideo = async (videoUrl: string) => {
  try {
    const res = await api.patch<ApiSuccess<Business>>('/business/me/storefront-video', {
      video_url: videoUrl,
    })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export const listStaff = async (params?: StaffListParams) => {
  try {
    const res = await api.get<ApiSuccess<StaffMember[]>>('/staff', { params })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const inviteStaff = async (data: InviteStaffRequest) => {
  try {
    const res = await api.post<ApiSuccess<StaffMember>>('/staff', data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const deactivateStaff = async (id: string) => {
  try {
    await api.delete<ApiMessage>(`/staff/${id}`)
  } catch (error) {
    handleApiError(error)
  }
}

// ─── Stores ───────────────────────────────────────────────────────────────────

export const createStore = async (data: CreateStoreRequest) => {
  try {
    const res = await api.post<ApiSuccess<Store>>('/stores', data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const listStores = async () => {
  try {
    const res = await api.get<ApiSuccess<Store[]>>('/stores')
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const getStore = async (id: string) => {
  try {
    const res = await api.get<ApiSuccess<Store>>(`/stores/${id}`)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const updateStore = async (id: string, data: UpdateStoreRequest) => {
  try {
    const res = await api.patch<ApiSuccess<Store>>(`/stores/${id}`, data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const setDefaultStore = async (id: string) => {
  try {
    await api.patch<ApiMessage>(`/stores/${id}/default`)
  } catch (error) {
    handleApiError(error)
  }
}

export const deleteStore = async (id: string) => {
  try {
    await api.delete<ApiMessage>(`/stores/${id}`)
  } catch (error) {
    handleApiError(error)
  }
}

// ─── Customers ────────────────────────────────────────────────────────────────

export const createCustomer = async (data: CreateCustomerRequest) => {
  try {
    const res = await api.post<ApiSuccess<Customer>>('/customers', data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const listCustomers = async (params?: CustomerListParams) => {
  try {
    const res = await api.get<ApiCursorList<Customer>>('/customers', { params })
    return res.data
  } catch (error) {
    handleApiError(error)
  }
}

export const getCustomer = async (id: string) => {
  try {
    const res = await api.get<ApiSuccess<Customer>>(`/customers/${id}`)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const updateCustomer = async (id: string, data: UpdateCustomerRequest) => {
  try {
    const res = await api.patch<ApiSuccess<Customer>>(`/customers/${id}`, data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const deleteCustomer = async (id: string) => {
  try {
    await api.delete<ApiMessage>(`/customers/${id}`)
  } catch (error) {
    handleApiError(error)
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const createProduct = async (data: CreateProductRequest, idempotencyKey?: string) => {
  try {
    const res = await api.post<ApiSuccess<Product>>('/products', data, {
      headers: idempotencyKey
        ? { 'X-Idempotency-Key': idempotencyKey }
        : undefined,
    })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const listProducts = async (params?: ProductListParams) => {
  try {
    const res = await api.get<ApiCursorList<Product>>('/products', { params })
    return res.data
  } catch (error) {
    handleApiError(error)
  }
}

export const getProduct = async (id: string) => {
  try {
    const res = await api.get<ApiSuccess<Product>>(`/products/${id}`)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const updateProduct = async (id: string, data: UpdateProductRequest) => {
  try {
    const res = await api.patch<ApiSuccess<Product>>(`/products/${id}`, data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const deleteProduct = async (id: string) => {
  try {
    await api.delete<ApiMessage>(`/products/${id}`)
  } catch (error) {
    handleApiError(error)
  }
}

export const adjustStock = async (id: string, data: AdjustStockRequest) => {
  try {
    const res = await api.post<ApiSuccess<Product>>(`/products/${id}/stock`, data)
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const uploadProductImage = async (id: string, file: File) => {
  try {
    const form = new FormData()
    form.append('image', file)

    const res = await api.post<ApiSuccess<{ image_url: string }>>(`/products/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}

export const scanProductByBarcode = async (barcode: string) => {
  try {
    const res = await api.get<ApiSuccess<Product>>('/products/scan', {
      params: { barcode },
    })
    return res.data.data
  } catch (error) {
    handleApiError(error)
  }
}