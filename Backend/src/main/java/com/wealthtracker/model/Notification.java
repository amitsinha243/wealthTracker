package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    private String userId; // recipient
    private String type; // e.g. "EXPENSE_BOOK_ADDED"
    private String message; // human-readable text
    private String referenceId; // links to expense book ID
    private boolean read; // default false

    private LocalDateTime createdAt;

    public Notification() {
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }
}
