import api from './client'
import type { ApiSuccess, ApiMessage, ApiCursorList } from './types'
import type {
  JobOpening,
  CreateJobRequest,
  JobListParams,
  RecruitmentApplication,
  ReviewApplicationRequest,
  ApplicationListParams,
  PublicJobItem,
  PublicJobListParams,
  PublicJobApplicationRequest,
} from './types'

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const createJob = (data: CreateJobRequest) =>
  api.post<ApiSuccess<JobOpening>>('/jobs', data).then((r) => r.data.data)

export const listJobs = (params?: JobListParams) =>
  api.get<ApiCursorList<JobOpening>>('/jobs', { params }).then((r) => r.data)

export const getJob = (id: string) =>
  api.get<ApiSuccess<JobOpening>>(`/jobs/${id}`).then((r) => r.data.data)

export const closeJob = (id: string) =>
  api.patch<ApiMessage>(`/jobs/${id}/close`).then(() => undefined)

// ─── Public Jobs ──────────────────────────────────────────────────────────────

export const listPublicJobs = (params?: PublicJobListParams) =>
  api.get<ApiCursorList<PublicJobItem>>('/public/jobs', { params }).then((r) => r.data)

export const getPublicJob = (slug: string) =>
  api.get<ApiSuccess<JobOpening>>(`/public/jobs/${slug}`).then((r) => r.data.data)

export const applyToPublicJob = async (
  id: string,
  data: PublicJobApplicationRequest
) => {
  const form = new FormData()
  form.append('first_name', data.first_name)
  form.append('last_name', data.last_name)
  form.append('email', data.email)
  form.append('phone_number', data.phone_number)

  if (data.cover_letter?.trim()) {
    form.append('cover_letter', data.cover_letter.trim())
  }

  if (data.cv) {
    form.append('cv', data.cv)
  }

  const response = await fetch(`/api/public/job-applications/${id}`, {
    method: 'POST',
    body: form,
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json?.message || 'Failed to submit application')
  }

  return json
}

// ─── Applications ─────────────────────────────────────────────────────────────

export const listApplications = (params?: ApplicationListParams) =>
  api.get<ApiCursorList<RecruitmentApplication>>('/applications', { params }).then((r) => r.data)

export const reviewApplication = (id: string, data: ReviewApplicationRequest) =>
  api
    .patch<ApiSuccess<RecruitmentApplication>>(`/applications/${id}/review`, data)
    .then((r) => r.data.data)