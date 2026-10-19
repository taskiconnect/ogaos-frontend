'use client'
import { DocumentPreview } from '@/features/documents/DocumentPreview'
import { saleDocument } from '@/features/documents/model'
import { getBusiness } from '@/lib/api/business'
import { generateReceipt, getSale } from '@/lib/api/finance'
import type { Sale } from '@/lib/api/types'
import { useAuthStore } from '@/stores/authStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
interface Props {
  sale: Sale | null
  onClose: () => void
}
export default function ReceiptModal({ sale, onClose }: Props) {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const detail = useQuery({
    queryKey: ['sale', sale?.id],
    queryFn: () => getSale(sale!.id),
    enabled: !!sale,
    staleTime: 0,
  })
  const business = useQuery({
    queryKey: ['business-me'],
    queryFn: getBusiness,
    enabled: !!sale && user?.role === 'owner',
  })
  const current = detail.data ?? sale
  const issue = useMutation({
    mutationFn: () => generateReceipt(sale!.id),
    onSuccess: (updated) => {
      qc.setQueryData(['sale', sale!.id], updated)
      void qc.invalidateQueries({ queryKey: ['sales'] })
    },
  })
  if (!current) return null
  return (
    <DocumentPreview
      canPrint={!detail.isError && !detail.isFetching && !!detail.data}
      document={saleDocument(current, business.data ?? user?.business)}
      onClose={onClose}
    >
      {detail.isFetching && <span className="text-xs text-slate-400">Refreshing…</span>}
      {detail.isError && (
        <span role="alert" className="text-xs text-amber-300">
          Could not refresh. Close and retry before issuing.
        </span>
      )}
      {issue.isError && (
        <span role="alert" className="text-xs text-red-300">
          {issue.error.message}
        </span>
      )}
      {!current.receipt_number && current.amount_paid > 0 && current.status !== 'cancelled' && (
        <button
          disabled={issue.isPending || detail.isFetching || detail.isError}
          onClick={() => issue.mutate()}
          className="rounded-xl border border-white/20 px-3 py-2 text-sm disabled:opacity-50"
        >
          {issue.isPending ? 'Issuing…' : 'Issue receipt number'}
        </button>
      )}
    </DocumentPreview>
  )
}
