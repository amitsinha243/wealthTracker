package com.wealthtracker.controller;

import com.wealthtracker.model.Expense;
import com.wealthtracker.repository.ExpenseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    
    private final ExpenseRepository expenseRepository;
    
    public ExpenseController(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAll(Authentication auth) {
        System.out.println("Authenticated user: " + auth.getPrincipal());
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(expenseRepository.findByUserId(userId));
    }
    
    @PostMapping
    public ResponseEntity<Expense> create(@RequestBody Expense expense, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        expense.setUserId(userId);
        expense.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(expenseRepository.save(expense));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        if (!expense.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        expenseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
