import { API_BASE_URL, getAuthToken } from '@/config/api';

export interface AssetDocumentInfo {
  id: string;
  physicalAssetId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export const assetDocumentAPI = {
  getAll: async (assetId: string): Promise<AssetDocumentInfo[]> => {
    const response = await fetch(`${API_BASE_URL}/physical-assets/${assetId}/documents`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  upload: async (assetId: string, file: File): Promise<AssetDocumentInfo> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/physical-assets/${assetId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload document');
    return response.json();
  },

  download: async (assetId: string, docId: string, fileName: string) => {
    const response = await fetch(`${API_BASE_URL}/physical-assets/${assetId}/documents/${docId}/download`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to download document');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  delete: async (assetId: string, docId: string) => {
    const response = await fetch(`${API_BASE_URL}/physical-assets/${assetId}/documents/${docId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete document');
  }
};
