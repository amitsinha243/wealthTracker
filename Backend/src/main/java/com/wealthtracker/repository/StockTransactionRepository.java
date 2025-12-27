package com.wealthtracker.repository;

import com.wealthtracker.model.StockTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StockTransactionRepository extends MongoRepository<StockTransaction, String> {
    List<StockTransaction> findByStockId(String stockId);
    List<StockTransaction> findByUserId(String userId);
    void deleteByStockId(String stockId);
}
