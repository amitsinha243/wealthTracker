package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "stock_transactions")
public class StockTransaction {
    @Id
    private String id;
    
    private String stockId;
    private String userId;
    private Double quantity;
    private Double purchasePrice;
    private LocalDate purchaseDate;
    private LocalDate createdAt;
    
    public StockTransaction() {
        this.createdAt = LocalDate.now();
    }
}
