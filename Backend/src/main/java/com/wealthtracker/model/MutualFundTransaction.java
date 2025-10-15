package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "mutual_fund_transactions")
public class MutualFundTransaction {
    @Id
    private String id;
    
    private String mutualFundId;
    private String userId;
    private Double units;
    private Double nav;
    private LocalDate purchaseDate;
    private LocalDate createdAt;
    
    public MutualFundTransaction() {
        this.createdAt = LocalDate.now();
    }
}
