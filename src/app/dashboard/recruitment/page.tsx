'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listJobs, closeJob, listApplications, reviewApplication } from '@/lib/api/recruitment'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Plus, Briefcase, Users, ChevronDown, XCircle, Eye, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JobOpening, RecruitmentApplication } from '@/lib/api/types'
import PostJobModal from '@/components/jobs/PostJobModal'

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}
function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time',
  contract: 'Contract',   internship: 'Internship',
}

const APP_STATUS_CLS: Record<string, string> = {
  new:          'bg-blue-500/10 text-blue-400 border-blue-500/20',
  reviewing:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  shortlisted:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  rejected:     'bg-red-500/10 text-red-400 border-red-500/20',
  hired:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

function ApplicationRow({ app, onReview }: { app: RecruitmentApplication; onReview: (id: string, status: string, notes?: string) => void }) {
  const [showReview, setShowReview] = useState(false)
  const [notes, setNotes]           = useState('')
  const st = APP_STATUS_CLS[app.status] ?? APP_STATUS_CLS.new

  return (
    <div className="bg-white/2 border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{app.first_name} {app.last_name}</p>
          <p className="text-xs text-gray-500">{app.email} {app.phone_number && `· ${app.phone_number}`}</p>
          {app.cover_letter && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{app.cover_letter}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {app.assessment_score !== null && (
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border',
              (app.assessment_passed ?? false) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
              {app.assessment_score}%
            </span>
          )}
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', st)}>
            {app.status}
          </span>
        </div>
      </div>

      {!showReview ? (
        <div className="flex gap-2 mt-3">
          <button onClick={() => setShowReview(true)}
            className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors">
            Review
          </button>
          {app.cv_url && (
            <a href={app.cv_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors">
              <Eye className="w-3 h-3" /> CV
            </a>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Review notes (optional)..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none resize-none" />
          <div className="flex gap-1.5 flex-wrap">
            {(['reviewing','shortlisted','rejected','hired'] as const).map(s => (
              <button key={s} onClick={() => { onReview(app.id, s, notes); setShowReview(false) }}
                className={cn('px-2.5 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all', APP_STATUS_CLS[s])}>
                {s}
              </button>
            ))}
            <button onClick={() => setShowReview(false)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-white/5 border-white/10 text-gray-400 hover:bg-white/10">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JobsPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate]   = useState(false)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [jobFilter, setJobFilter]     = useState<'open'|'closed'|''>('')

  const { data: jobsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['jobs', jobFilter],
    queryFn: ({ pageParam }) => listJobs({
      limit: 20, cursor: pageParam as string | undefined,
      status: jobFilter || undefined,
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) => last.next_cursor ?? undefined,
  })

  const allJobs: JobOpening[] = useMemo(
    () => (jobsData?.pages ?? []).flatMap((p: any) => p.data ?? []), [jobsData]
  )

  const { data: appsData } = useInfiniteQuery({
    queryKey: ['applications', expandedJob],
    queryFn: ({ pageParam }) => listApplications({
      limit: 50, cursor: pageParam as string | undefined,
      job_id: expandedJob ?? undefined,
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) => last.next_cursor ?? undefined,
    enabled: !!expandedJob,
  })
  const applications: RecruitmentApplication[] = useMemo(
    () => (appsData?.pages ?? []).flatMap((p: any) => p.data ?? []), [appsData]
  )

  const closeMut = useMutation({
    mutationFn: (id: string) => closeJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
  const reviewMut = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      reviewApplication(id, { status, review_notes: notes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })

  const openCount   = allJobs.filter(j => j.status === 'open').length
  const closedCount = allJobs.filter(j => j.status === 'closed').length
  const totalApps   = allJobs.reduce((s, j) => s + j.application_count, 0)

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="p-6 lg:p-10 space-y-8 pb-20">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Recruitment</h1>
              <p className="text-gray-400 mt-1 text-sm">Post jobs and manage applications</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              <Plus className="w-4 h-4" /> Post Job
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Open Jobs</p>
              <p className="text-2xl font-bold text-emerald-400">{openCount}</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Closed</p>
              <p className="text-2xl font-bold text-gray-400">{closedCount}</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Applicants</p>
              <p className="text-2xl font-bold text-blue-400">{totalApps}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {([['', 'All'], ['open', 'Open'], ['closed', 'Closed']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setJobFilter(v)}
                className={cn('px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                  jobFilter === v ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                {l}
              </button>
            ))}
          </div>

          {/* Jobs list */}
          {isLoading ? (
            <div className="p-10 text-center text-gray-500 text-sm">Loading jobs...</div>
          ) : allJobs.length === 0 ? (
            <div className="p-16 flex flex-col items-center text-center bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl">
              <Briefcase className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No jobs posted yet</p>
              <p className="text-gray-600 text-sm mt-1">Post your first job to start receiving applications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allJobs.map(job => (
                <div key={job.id} className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden">
                  {/* Job header */}
                  <div className="flex items-start gap-4 p-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-400">{JOB_TYPE_LABELS[job.type] ?? job.type}</span>
                            {job.location && <span className="text-xs text-gray-500">{job.location}</span>}
                            {job.is_remote && <span className="text-xs text-blue-400">Remote</span>}
                            {job.salary_range_min && job.salary_range_max && (
                              <span className="text-xs text-emerald-400">
                                {fmt(job.salary_range_min)} – {fmt(job.salary_range_max)}/mo
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border shrink-0',
                          job.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20')}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                    </div>
                  </div>

                  {/* Job footer */}
                  <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/5">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {job.application_count} applicant{job.application_count !== 1 ? 's' : ''}
                      </span>
                      {job.application_deadline && (
                        <span>Deadline: {fmtDate(job.application_deadline)}</span>
                      )}
                      {job.assessment_enabled && (
                        <span className="text-purple-400">Assessment enabled</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors">
                        <Users className="w-3.5 h-3.5" /> Applications
                        <ChevronDown className={cn('w-3 h-3 transition-transform', expandedJob === job.id ? 'rotate-180' : '')} />
                      </button>
                      {job.status === 'open' && (
                        <button onClick={() => closeMut.mutate(job.id)} disabled={closeMut.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Close
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Applications panel */}
                  {expandedJob === job.id && (
                    <div className="border-t border-white/10 p-5 space-y-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Applications ({applications.length})
                      </h4>
                      {applications.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">No applications yet</p>
                      ) : (
                        applications.map(app => (
                          <ApplicationRow key={app.id} app={app}
                            onReview={(id, status, notes) => reviewMut.mutate({ id, status, notes })} />
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="text-center">
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10">
                <ChevronDown className="w-4 h-4" />{isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}

        </main>
      </div>

      <PostJobModal open={showCreate} onOpenChange={setShowCreate}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['jobs'] })} />
    </div>
  )
}
