import { API_BASE_URL, getAuthHeaders } from '@/config/api';

export const aiAPI = {
  chat: async (message: string) => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  }
};
