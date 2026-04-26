package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "expense_book_expenses")
public class ExpenseBookExpense {
    @Id
    private String id;

    private String expenseBookId;
    private String description;
    private Double amount;
    private String paidBy; // display name of who paid
    private String paidByUserId; // userId for accuracy
    private LocalDate expenseDate;
    private String addedByUserId; // userId who created this entry

    private LocalDate createdAt;
    private LocalDate updatedAt;

    public ExpenseBookExpense() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}
