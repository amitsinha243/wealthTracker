package com.wealthtracker.repository;

import com.wealthtracker.model.TripExpense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripExpenseRepository extends MongoRepository<TripExpense, String> {
    List<TripExpense> findByTripIdOrderByExpenseDateDesc(String tripId);
}
