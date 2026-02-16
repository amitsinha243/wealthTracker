package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "asset_documents")
public class AssetDocument {
    @Id
    private String id;

    private String physicalAssetId;
    private String userId;
    private String fileName;
    private String contentType;
    private long fileSize;
    private String gridFsFileId; // Reference to the file in GridFS

    private LocalDateTime uploadedAt;

    public AssetDocument() {
        this.uploadedAt = LocalDateTime.now();
    }
}
