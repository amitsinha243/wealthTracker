package com.wealthtracker.repository;

import com.wealthtracker.model.ExpenseBookExpense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseBookExpenseRepository extends MongoRepository<ExpenseBookExpense, String> {
    List<ExpenseBookExpense> findByExpenseBookIdOrderByExpenseDateDesc(String expenseBookId);
}
