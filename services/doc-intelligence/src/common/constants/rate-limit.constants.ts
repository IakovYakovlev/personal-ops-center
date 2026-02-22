export const RATE_LIMIT_KEY = 'rateLimit';
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour

export const RATE_LIMITS = {
  UPLOAD_FILE: parseInt(process.env.UPLOAD_RATE_LIMIT || '5', 10),
  GET_JOB_RESULT: parseInt(process.env.GET_RATE_LIMIT || '5', 10),
};
