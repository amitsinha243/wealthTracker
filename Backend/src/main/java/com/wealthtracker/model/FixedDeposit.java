package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "fixed_deposits")
public class FixedDeposit {
    @Id
    private String id;

    private String userId;
    private String bankName;
    private Double amount;
    private Double interestRate;
    private LocalDate maturityDate; // <- changed from LocalDateTime

    private LocalDate createdAt;
    private LocalDate updatedAt;

    public FixedDeposit() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}
