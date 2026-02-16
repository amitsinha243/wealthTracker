import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { physicalAssetAPI } from '@/services/physicalAssetApi';

export interface PhysicalAsset {
  id: string;
  assetName: string;
  assetType: string;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PHYSICAL_ASSET_TYPES = [
  'Bike',
  'Car',
  'House',
  'Land',
  'Jewelry',
  'Electronics',
  'Furniture',
  'Other'
] as const;

export type PhysicalAssetType = typeof PHYSICAL_ASSET_TYPES[number];

export const usePhysicalAssets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<PhysicalAsset[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await physicalAssetAPI.getAll();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching physical assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [user]);

  const addAsset = async (asset: Omit<PhysicalAsset, 'id'>) => {
    if (!user) return;
    try {
      await physicalAssetAPI.create(asset);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error adding physical asset:', error);
      throw error;
    }
  };

  const updateAsset = async (id: string, asset: Partial<PhysicalAsset>) => {
    if (!user) return;
    try {
      await physicalAssetAPI.update(id, asset);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error updating physical asset:', error);
      throw error;
    }
  };

  const deleteAsset = async (id: string) => {
    if (!user) return;
    try {
      await physicalAssetAPI.delete(id);
      setTimeout(() => fetchAssets(), 500);
    } catch (error) {
      console.error('Error deleting physical asset:', error);
      throw error;
    }
  };

  return { assets, loading, fetchAssets, addAsset, updateAsset, deleteAsset };
};
