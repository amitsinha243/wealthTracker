import { API_BASE_URL, getAuthHeaders } from '@/config/api';

export const physicalAssetAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/physical-assets`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch physical assets');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/physical-assets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create physical asset');
    return response.json();
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/physical-assets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update physical asset');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/physical-assets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete physical asset');
  }
};
