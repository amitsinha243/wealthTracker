package com.wealthtracker.repository;

import com.wealthtracker.model.PhysicalAsset;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PhysicalAssetRepository extends MongoRepository<PhysicalAsset, String> {
    List<PhysicalAsset> findByUserId(String userId);
}
