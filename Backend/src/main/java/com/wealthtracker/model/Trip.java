package com.wealthtracker.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "trips")
public class Trip {
    @Id
    private String id;

    private String userId;
    private String tripName;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> participants;

    private LocalDate createdAt;
    private LocalDate updatedAt;

    public Trip() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}
