import api from '@/lib/api/client'
import type { LGAsResponse, StatesResponse } from '@/lib/api/types'

export async function getStates(): Promise<string[]> {
  const { data } = await api.get<StatesResponse>('/locations/states')
  return Array.isArray(data?.data) ? data.data : []
}

export async function getLGAs(state: string): Promise<string[]> {
  const { data } = await api.get<LGAsResponse>('/locations/lgas', {
    params: { state },
  })
  return Array.isArray(data?.data) ? data.data : []
}