package com.wealthtracker.repository;

import com.wealthtracker.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByUserId(String userId);
    boolean existsBySourceDepositIdAndDateBetween(String sourceDepositId, LocalDate start, LocalDate end);
}
