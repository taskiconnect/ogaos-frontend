'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createJob } from '@/lib/api/recruitment'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreateJobRequest } from '@/lib/api/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}

const JOB_TYPES = [
  { value: 'full_time',  label: 'Full-time' },
  { value: 'part_time',  label: 'Part-time' },
  { value: 'contract',   label: 'Contract'  },
  { value: 'internship', label: 'Internship'},
] as const

const ASSESSMENT_CATEGORIES = [
  'General Aptitude', 'Numerical Reasoning', 'Verbal Reasoning',
  'Logical Reasoning', 'Customer Service', 'Sales Aptitude',
]

export default function PostJobModal({ open, onOpenChange, onSuccess }: Props) {
  const [title,          setTitle]          = useState('')
  const [description,    setDescription]    = useState('')
  const [requirements,   setRequirements]   = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [type,           setType]           = useState<CreateJobRequest['type']>('full_time')
  const [location,       setLocation]       = useState('')
  const [isRemote,       setIsRemote]       = useState(false)
  const [salaryMin,      setSalaryMin]      = useState('')
  const [salaryMax,      setSalaryMax]      = useState('')
  const [deadline,       setDeadline]       = useState('')
  const [enableAssess,   setEnableAssess]   = useState(false)
  const [assessCat,      setAssessCat]      = useState('General Aptitude')
  const [threshold,      setThreshold]      = useState('60')
  const [timeLimit,      setTimeLimit]      = useState('30')
  const [error,          setError]          = useState('')

  function reset() {
    setTitle(''); setDescription(''); setRequirements(''); setResponsibilities('')
    setType('full_time'); setLocation(''); setIsRemote(false); setSalaryMin(''); setSalaryMax('')
    setDeadline(''); setEnableAssess(false); setAssessCat('General Aptitude')
    setThreshold('60'); setTimeLimit('30'); setError('')
  }

  const mut = useMutation({
    mutationFn: (d: CreateJobRequest) => createJob(d),
    onSuccess: () => { onSuccess(); onOpenChange(false); reset() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to post job'),
  })

  function handleSubmit() {
    setError('')
    if (!title.trim())       { setError('Job title is required'); return }
    if (!description.trim()) { setError('Description is required'); return }
    mut.mutate({
      title: title.trim(), description: description.trim(),
      requirements: requirements.trim() || undefined,
      responsibilities: responsibilities.trim() || undefined,
      type, location: location.trim() || undefined, is_remote: isRemote,
      salary_range_min: salaryMin ? Math.round(parseFloat(salaryMin) * 100) : undefined,
      salary_range_max: salaryMax ? Math.round(parseFloat(salaryMax) * 100) : undefined,
      application_deadline: deadline || undefined,
      assessment_enabled: enableAssess,
      assessment_category: enableAssess ? assessCat : undefined,
      pass_threshold: enableAssess ? parseInt(threshold) : undefined,
      time_limit_minutes: enableAssess ? parseInt(timeLimit) : undefined,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto bg-[#0f0f14] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl">

        <div className="sticky top-0 bg-[#0f0f14] flex items-center justify-between px-6 py-4 border-b border-white/10 z-10">
          <h2 className="text-lg font-bold">Post New Job</h2>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Job Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sales Representative"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Job Type</label>
            <div className="flex gap-2 flex-wrap">
              {JOB_TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={cn('px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                    type === t.value ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Lagos, Nigeria"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setIsRemote(v => !v)}
                className={cn('w-10 h-6 rounded-full border transition-all relative shrink-0', isRemote ? 'bg-primary border-primary' : 'bg-white/5 border-white/20')}>
                <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', isRemote ? 'left-4' : 'left-0.5')} />
              </button>
              <span className="text-sm text-gray-300">Remote OK</span>
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Min Salary (₦/mo)</label>
              <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="50000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Max Salary (₦/mo)</label>
              <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="100000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Application Deadline</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              placeholder="Describe the role, company culture, and what makes this a great opportunity..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Requirements</label>
            <textarea value={requirements} onChange={e => setRequirements(e.target.value)} rows={3}
              placeholder="Minimum qualifications, experience level, skills needed..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Responsibilities</label>
            <textarea value={responsibilities} onChange={e => setResponsibilities(e.target.value)} rows={3}
              placeholder="Key duties and day-to-day responsibilities..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none" />
          </div>

          {/* Assessment toggle */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Aptitude Assessment</p>
                <p className="text-xs text-gray-400">Automatically screen applicants with an online test</p>
              </div>
              <button onClick={() => setEnableAssess(v => !v)}
                className={cn('w-10 h-6 rounded-full border transition-all relative shrink-0', enableAssess ? 'bg-purple-500 border-purple-500' : 'bg-white/5 border-white/20')}>
                <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', enableAssess ? 'left-4' : 'left-0.5')} />
              </button>
            </div>

            {enableAssess && (
              <div className="space-y-3 pt-2 border-t border-purple-500/20">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                  <select value={assessCat} onChange={e => setAssessCat(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                    {ASSESSMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pass Score (%)</label>
                    <input type="number" min="0" max="100" value={threshold} onChange={e => setThreshold(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Time Limit (min)</label>
                    <input type="number" min="5" value={timeLimit} onChange={e => setTimeLimit(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={handleSubmit} disabled={mut.isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  )
}
