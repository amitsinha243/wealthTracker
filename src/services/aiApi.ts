import { API_BASE_URL, getAuthHeaders } from '@/config/api';

export interface AgentReport {
  agentType: string;
  report: string;
  generatedAt: string;
}

export const aiAPI = {
  chat: async (message: string) => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  getPortfolioAnalysis: async (): Promise<AgentReport> => {
    const response = await fetch(`${API_BASE_URL}/ai/portfolio-analysis`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch portfolio analysis');
    return response.json();
  },

  getExpenseAnalysis: async (): Promise<AgentReport> => {
    const response = await fetch(`${API_BASE_URL}/ai/expense-analysis`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch expense analysis');
    return response.json();
  },

  getRecommendations: async (): Promise<AgentReport> => {
    const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  },
};
