package com.wealthtracker.repository;

import com.wealthtracker.model.MutualFundTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MutualFundTransactionRepository extends MongoRepository<MutualFundTransaction, String> {
    List<MutualFundTransaction> findByMutualFundId(String mutualFundId);
    List<MutualFundTransaction> findByUserId(String userId);
}
