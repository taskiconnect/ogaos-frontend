// src/lib/api/recruitment.ts
import api from './client'
import type { ApiSuccess, ApiMessage, ApiCursorList } from './types'
import type {
  JobOpening, CreateJobRequest, JobListParams,
  RecruitmentApplication, ReviewApplicationRequest, ApplicationListParams,
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

// ─── Applications ─────────────────────────────────────────────────────────────

export const listApplications = (params?: ApplicationListParams) =>
  api.get<ApiCursorList<RecruitmentApplication>>('/applications', { params }).then((r) => r.data)

export const reviewApplication = (id: string, data: ReviewApplicationRequest) =>
  api
    .patch<ApiSuccess<RecruitmentApplication>>(`/applications/${id}/review`, data)
    .then((r) => r.data.data)
