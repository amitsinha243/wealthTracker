package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "expenses")
public class Expense {
    @Id
    private String id;

    private String userId;
    private String category;
    private Double amount;
    private LocalDate date;
    private String description;
    private String savingsAccountId; // Optional: link to savings account for auto-deduction

    private LocalDate createdAt;
    private LocalDate updatedAt;

    public Expense() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}
