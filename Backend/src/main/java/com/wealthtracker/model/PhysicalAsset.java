package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "physical_assets")
public class PhysicalAsset {
    @Id
    private String id;

    private String userId;
    private String assetName;
    private String assetType;
    private Double purchasePrice;
    private Double currentValue;
    private LocalDate purchaseDate;
    private String description;

    private LocalDate createdAt;
    private LocalDate updatedAt;

    public PhysicalAsset() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}
