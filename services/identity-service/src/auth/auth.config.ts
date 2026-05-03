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
      // TODO: Вернуть обратно 15m --- IGNORE ---
      expiresIn: '3h',
      blacklistTtl: 900, // 15 minutes in seconds
    },
    reset: {
      expiresIn: '15m',
      expiresInSeconds: 900, // 15 minutes in seconds
    },
    access: {
      expiresIn: '15m',
    },
  },
} as const;
