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
    private LocalDate maturityDate;
    private String depositType; // "FD" for Fixed Deposit, "RD" for Recurring Deposit
    private LocalDate startDate; // When the RD actually started (for RDs)

    private LocalDate createdAt;
    private LocalDate updatedAt;

    public FixedDeposit() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
        this.depositType = "FD"; // Default to Fixed Deposit
    }
}
