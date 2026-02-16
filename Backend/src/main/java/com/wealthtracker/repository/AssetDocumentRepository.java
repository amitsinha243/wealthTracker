package com.wealthtracker.repository;

import com.wealthtracker.model.AssetDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AssetDocumentRepository extends MongoRepository<AssetDocument, String> {
    List<AssetDocument> findByPhysicalAssetIdAndUserId(String physicalAssetId, String userId);
    void deleteByPhysicalAssetIdAndUserId(String physicalAssetId, String userId);
}
