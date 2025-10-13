package com.wealthtracker.repository;

import com.wealthtracker.model.Income;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeRepository extends MongoRepository<Income, String> {
    List<Income> findByUserId(String userId);
}
