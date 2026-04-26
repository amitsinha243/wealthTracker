package com.wealthtracker.repository;

import com.wealthtracker.model.ExpenseBook;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseBookRepository extends MongoRepository<ExpenseBook, String> {
    List<ExpenseBook> findByMemberUserIdsContaining(String userId);
    List<ExpenseBook> findByCreatedBy(String userId);
}
