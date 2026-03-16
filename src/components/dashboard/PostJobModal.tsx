'use client'

import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Briefcase, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createJob } from '@/lib/api/recruitment'

// Define the schema with explicit typing
const schema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(10, 'At least 10 characters required'),
  type: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  location: z.string().optional(),
  is_remote: z.boolean(),
  salary_min: z.union([z.number().min(0), z.undefined()]).optional(),
  salary_max: z.union([z.number().min(0), z.undefined()]).optional(),
  deadline: z.string().optional(),
})

// Infer the type from the schema
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess?: () => void
}

export default function PostJobModal({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any, // Type assertion to bypass the inference issue
    defaultValues: {
      type: 'full_time',
      is_remote: false,
      salary_min: undefined,
      salary_max: undefined,
    },
  })

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setLoading(true)
    try {
      await createJob({
        title: values.title,
        description: values.description,
        type: values.type,
        location: values.location || undefined,
        is_remote: values.is_remote,
        // Backend expects kobo — multiply naira by 100
        salary_range_min: values.salary_min != null ? values.salary_min * 100 : undefined,
        salary_range_max: values.salary_max != null ? values.salary_max * 100 : undefined,
        application_deadline: values.deadline || undefined,
      })
      toast.success('Job posted successfully!')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to post job. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const inp = 'w-full h-10 px-3 rounded-xl bg-dash-subtle border border-dash-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all'
  const lbl = 'block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg bg-dash-raised border border-dash-border rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Post a Job</h2>
              <p className="text-xs text-muted-foreground">Find the right person fast</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={lbl}>Job Title *</label>
            <input className={inp} placeholder="e.g. Senior Sales Representative" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Type *</label>
              <select className={cn(inp, 'cursor-pointer')} {...form.register('type')}>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Location</label>
              <input className={inp} placeholder="Lagos, Nigeria" {...form.register('location')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Min Salary (₦/mo)</label>
              <input type="number" className={inp} placeholder="80000" {...form.register('salary_min')} />
            </div>
            <div>
              <label className={lbl}>Max Salary (₦/mo)</label>
              <input type="number" className={inp} placeholder="150000" {...form.register('salary_max')} />
            </div>
          </div>

          <div>
            <label className={lbl}>Application Deadline</label>
            <input type="date" className={inp} {...form.register('deadline')} />
          </div>

          <div>
            <label className={lbl}>Description *</label>
            <textarea rows={4} className={cn(inp, 'h-auto py-2.5 resize-none')}
              placeholder="Describe the role, responsibilities, and what success looks like…"
              {...form.register('description')} />
            {form.formState.errors.description && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 py-1">
            <input type="checkbox" id="is_remote" className="w-4 h-4 rounded accent-primary cursor-pointer"
              {...form.register('is_remote')} />
            <label htmlFor="is_remote" className="text-sm text-foreground cursor-pointer">
              This is a remote position
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl border border-dash-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              {loading ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}