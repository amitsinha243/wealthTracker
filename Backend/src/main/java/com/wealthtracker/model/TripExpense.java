package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "trip_expenses")
public class TripExpense {
    @Id
    private String id;

    private String tripId;
    private String description;
    private Double amount;
    private String paidBy;
    private LocalDate expenseDate;

    private LocalDate createdAt;
    private LocalDate updatedAt;

    public TripExpense() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}
