const API_BASE = 'http://localhost:3002';

function getPlan(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userPlan') || 'pro';
  }
  return 'pro';
}

export const docService = {
  uploadDocument: async (file: File, strategy: 'sync' | 'async') => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload/file?strategy=${strategy}`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Browser automatically sends httpOnly cookie
      headers: {
        plan: getPlan(),
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Upload failed');
    }

    return response.json();
  },

  getJobResult: async (jobId: string) => {
    const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'GET',
      credentials: 'include', // Browser automatically sends httpOnly cookie
      headers: {
        plan: getPlan(),
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error('Failed to fetch job result');
    }

    return response.json();
  },
};
