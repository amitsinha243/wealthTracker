package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "mutual_funds")
public class MutualFund {
    @Id
    private String id;
    
    private String userId;
    private String fundName;
    private String schemeName;
    private Double units;
    private Double nav;
    private LocalDate purchaseDate;
    
    private LocalDate createdAt;
    private LocalDate updatedAt;
    
    public MutualFund() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}
