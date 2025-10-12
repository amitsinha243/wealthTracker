package com.wealthtracker.repository;

import com.wealthtracker.model.Stock;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StockRepository extends MongoRepository<Stock, String> {
    List<Stock> findByUserId(String userId);
}
