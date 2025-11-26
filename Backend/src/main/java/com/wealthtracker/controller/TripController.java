package com.wealthtracker.controller;

import com.wealthtracker.model.Trip;
import com.wealthtracker.model.TripExpense;
import com.wealthtracker.repository.TripRepository;
import com.wealthtracker.repository.TripExpenseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {
    
    private final TripRepository tripRepository;
    private final TripExpenseRepository tripExpenseRepository;
    
    public TripController(TripRepository tripRepository, TripExpenseRepository tripExpenseRepository) {
        this.tripRepository = tripRepository;
        this.tripExpenseRepository = tripExpenseRepository;
    }

    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(tripRepository.findByUserId(userId));
    }
    
    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        trip.setUserId(userId);
        trip.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(tripRepository.save(trip));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable String id, @RequestBody Trip trip, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Trip existingTrip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!existingTrip.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        trip.setId(id);
        trip.setUserId(userId);
        trip.setCreatedAt(existingTrip.getCreatedAt());
        trip.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(tripRepository.save(trip));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        // Delete all expenses associated with this trip
        List<TripExpense> expenses = tripExpenseRepository.findByTripId(id);
        tripExpenseRepository.deleteAll(expenses);
        
        tripRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{tripId}/expenses")
    public ResponseEntity<List<TripExpense>> getTripExpenses(@PathVariable String tripId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(tripExpenseRepository.findByTripId(tripId));
    }
    
    @PostMapping("/{tripId}/expenses")
    public ResponseEntity<TripExpense> addExpense(@PathVariable String tripId, @RequestBody TripExpense expense, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        expense.setTripId(tripId);
        expense.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(tripExpenseRepository.save(expense));
    }
    
    @PutMapping("/{tripId}/expenses/{expenseId}")
    public ResponseEntity<TripExpense> updateExpense(@PathVariable String tripId, @PathVariable String expenseId, @RequestBody TripExpense expense, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        TripExpense existingExpense = tripExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        if (!existingExpense.getTripId().equals(tripId)) {
            return ResponseEntity.status(403).build();
        }
        
        expense.setId(expenseId);
        expense.setTripId(tripId);
        expense.setCreatedAt(existingExpense.getCreatedAt());
        expense.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(tripExpenseRepository.save(expense));
    }
    
    @DeleteMapping("/{tripId}/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String tripId, @PathVariable String expenseId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        TripExpense expense = tripExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        if (!expense.getTripId().equals(tripId)) {
            return ResponseEntity.status(403).build();
        }
        
        tripExpenseRepository.deleteById(expenseId);
        return ResponseEntity.ok().build();
    }
}
