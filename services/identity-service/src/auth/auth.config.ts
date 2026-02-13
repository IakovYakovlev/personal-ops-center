export const authConfig = {
  register: {
    limit: 2,
    ttl: 3600, // 1 hour
  },
  reset: {
    limit: 2,
    ttl: 3600, // 1 hour
  },
  email: {
    dailyLimit: 100,
    dailyTtl: 86400, // 1 day
  },
  token: {
    verification: {
      expiresIn: '15m',
      blacklistTtl: 900, // 15 minutes
    },
    reset: {
      expiresIn: '15m',
    },
    access: {
      expiresIn: '15m',
    },
  },
} as const;
