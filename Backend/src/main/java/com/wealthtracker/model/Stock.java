package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "stocks")
public class Stock {
    @Id
    private String id;
    
    private String userId;
    private String stockName;
    private String symbol;
    private Double quantity;
    private Double purchasePrice;
    private LocalDate purchaseDate;
    
    private LocalDate createdAt;
    private LocalDate updatedAt;
    
    public Stock() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}
