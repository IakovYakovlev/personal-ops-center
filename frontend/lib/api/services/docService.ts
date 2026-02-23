const API_BASE = 'http://localhost:3002';

export const docService = {
  uploadDocument: async (file: File, strategy: 'sync' | 'async') => {
    // Validation layer 3: Final check before network request
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF, DOCX, and TXT files are supported.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Strategy determines the plan: sync = free, async = pro
    const plan = strategy === 'sync' ? 'free' : 'pro';

    const response = await fetch(`${API_BASE}/upload/file?strategy=${strategy}`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Browser automatically sends httpOnly cookie
      headers: {
        plan,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Upload failed (${response.status})`;
      throw new Error(errorMessage);
    }

    return response.json();
  },

  getJobResult: async (jobId: string) => {
    const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'GET',
      credentials: 'include', // Browser automatically sends httpOnly cookie
      headers: {
        plan: 'pro', // Job results are always from async/pro plan
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Failed to fetch job result (${response.status})`;
      throw new Error(errorMessage);
    }

    return response.json();
  },
};
