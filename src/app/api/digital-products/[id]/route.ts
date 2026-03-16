import { proxyRequest } from '@/lib/api/proxy'
import { NextRequest } from 'next/server'

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return proxyRequest(req, `/digital-products/${id}`, 'GET')
}

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return proxyRequest(req, `/digital-products/${id}`, 'PATCH')
}

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return proxyRequest(req, `/digital-products/${id}`, 'DELETE')
}