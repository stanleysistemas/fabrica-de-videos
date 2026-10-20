import { ProjectConfig } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  async analyzeVideo(url: string) {
    const res = await fetch(`${API_BASE_URL}/analyze-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return await res.json();
  },

  async generateScript(params: {
    topic: string;
    targetDurationSeconds: number;
    styleClima: string;
    blueprint?: any;
    brandName?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/generate-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  },

  async renderVideo(project: ProjectConfig) {
    const res = await fetch(`${API_BASE_URL}/render-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project }),
    });
    return await res.json();
  },
};
