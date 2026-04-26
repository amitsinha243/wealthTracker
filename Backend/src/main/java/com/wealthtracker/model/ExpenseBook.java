package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "expense_books")
public class ExpenseBook {
    @Id
    private String id;

    private String name;
    private String description;
    private String createdBy; // userId of the creator
    private List<String> memberUserIds = new ArrayList<>(); // list of user IDs
    private List<String> memberEmails = new ArrayList<>(); // denormalized for display
    private List<String> memberNames = new ArrayList<>(); // denormalized for display

    private LocalDate createdAt;
    private LocalDate updatedAt;

    public ExpenseBook() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}
