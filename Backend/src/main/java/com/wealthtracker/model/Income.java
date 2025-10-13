package com.wealthtracker.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "incomes")
public class Income {
    @Id
    private String id;
    private String userId;
    private Double amount;
    private LocalDate date;
    private String source;
    private String description;

    public Income() {}

    public Income(String userId, Double amount, LocalDate date, String source, String description) {
        this.userId = userId;
        this.amount = amount;
        this.date = date;
        this.source = source;
        this.description = description;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
