export const JobStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]

export interface Job {
  id: string
  type: string
  status: JobStatus
  payload: Record<string, unknown>
  result: unknown
  error: { code: string, message: string } | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Job Repository interface
 *
 * Abstract interface for async job data access
 */
export interface JobRepository {
  findById(id: string): Promise<Job | null>
  create(job: Omit<Job, 'createdAt' | 'updatedAt'>): Promise<Job>
  updateStatus(id: string, status: JobStatus, result?: unknown, error?: { code: string, message: string }): Promise<void>
}

export const JOB_REPOSITORY = Symbol('JOB_REPOSITORY')
