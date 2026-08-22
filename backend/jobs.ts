export interface BulkJob {
  id: string;
  type: string;
  username: string;
  status: "running" | "completed";
  total: number;
  sent: number;
  notOnWhatsapp: number;
  failed: number;
  errors: string[];
  startedAt: string;
  finishedAt?: string;
}

const jobs = new Map<string, BulkJob>();
let counter = 0;
const MAX_JOBS = 100;

export function createJob(type: string, username: string, total: number): BulkJob {
  const job: BulkJob = {
    id: `${type}-${++counter}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    username,
    status: "running",
    total,
    sent: 0,
    notOnWhatsapp: 0,
    failed: 0,
    errors: [],
    startedAt: new Date().toISOString(),
  };
  jobs.set(job.id, job);
  if (jobs.size > MAX_JOBS) {
    const oldest = jobs.keys().next().value;
    if (oldest) jobs.delete(oldest);
  }
  return job;
}

export function finishJob(job: BulkJob): void {
  job.status = "completed";
  job.finishedAt = new Date().toISOString();
}

export function getJob(id: string): BulkJob | undefined {
  return jobs.get(id);
}

export function getJobs(username?: string): BulkJob[] {
  const all = Array.from(jobs.values());
  return username ? all.filter((j) => j.username === username) : all;
}
