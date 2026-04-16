import { NextRequest } from 'next/server'

const BACKEND =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8080/api/v1'

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    const target = new URL(`${BACKEND}/invoices/${id}/pdf`)

    const headers = new Headers()

    const auth = req.headers.get('authorization')
    if (auth) headers.set('authorization', auth)

    const cookie = req.headers.get('cookie')
    if (cookie) headers.set('cookie', cookie)

    const response = await fetch(target.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    const body = await response.arrayBuffer()

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/pdf',
        'Content-Disposition':
          response.headers.get('content-disposition') || `inline; filename="invoice-${id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[PROXY] GET /invoices/:id/pdf —', error)
    return new Response('Internal server error', { status: 500 })
  }
}