import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { tripAPI } from '@/services/api';

export interface Trip {
  id: string;
  userId: string;
  tripName: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  participants: string[];
}

export interface TripExpense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  paidBy: string;
  expenseDate: string;
}

export const useTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await tripAPI.getAll();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const addTrip = async (tripData: Omit<Trip, 'id' | 'userId'>) => {
    await tripAPI.create(tripData);
    await fetchTrips();
  };

  const updateTrip = async (id: string, tripData: Partial<Trip>) => {
    await tripAPI.update(id, tripData);
    await fetchTrips();
  };

  const deleteTrip = async (id: string) => {
    await tripAPI.delete(id);
    await fetchTrips();
  };

  const getTripExpenses = async (tripId: string) => {
    return await tripAPI.getExpenses(tripId);
  };

  const addTripExpense = async (tripId: string, expenseData: Omit<TripExpense, 'id' | 'tripId'>) => {
    await tripAPI.addExpense(tripId, expenseData);
  };

  const updateTripExpense = async (tripId: string, expenseId: string, expenseData: Partial<TripExpense>) => {
    await tripAPI.updateExpense(tripId, expenseId, expenseData);
  };

  const deleteTripExpense = async (tripId: string, expenseId: string) => {
    await tripAPI.deleteExpense(tripId, expenseId);
  };

  return {
    trips,
    loading,
    addTrip,
    updateTrip,
    deleteTrip,
    getTripExpenses,
    addTripExpense,
    updateTripExpense,
    deleteTripExpense
  };
};
