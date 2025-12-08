package com.wealthtracker.controller;

import com.wealthtracker.model.Expense;
import com.wealthtracker.model.SavingsAccount;
import com.wealthtracker.repository.ExpenseRepository;
import com.wealthtracker.repository.SavingsAccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    
    private final ExpenseRepository expenseRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    
    public ExpenseController(ExpenseRepository expenseRepository, SavingsAccountRepository savingsAccountRepository) {
        this.expenseRepository = expenseRepository;
        this.savingsAccountRepository = savingsAccountRepository;
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
        
        // If a savings account is selected, deduct the expense amount from it
        if (expense.getSavingsAccountId() != null && !expense.getSavingsAccountId().isEmpty()) {
            SavingsAccount account = savingsAccountRepository.findById(expense.getSavingsAccountId())
                    .orElseThrow(() -> new RuntimeException("Savings account not found"));
            
            // Verify the account belongs to the user
            if (!account.getUserId().equals(userId)) {
                return ResponseEntity.status(403).build();
            }
            
            // Deduct the amount from the savings account
            account.setBalance(account.getBalance() - expense.getAmount());
            account.setUpdatedAt(LocalDate.now());
            savingsAccountRepository.save(account);
        }
        
        return ResponseEntity.ok(expenseRepository.save(expense));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable String id, @RequestBody Expense expenseDetails, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        if (!expense.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        expense.setCategory(expenseDetails.getCategory());
        expense.setAmount(expenseDetails.getAmount());
        expense.setDate(expenseDetails.getDate());
        expense.setDescription(expenseDetails.getDescription());
        expense.setSavingsAccountId(expenseDetails.getSavingsAccountId());
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
        
        // If the expense was linked to a savings account, restore the amount
        if (expense.getSavingsAccountId() != null && !expense.getSavingsAccountId().isEmpty()) {
            SavingsAccount account = savingsAccountRepository.findById(expense.getSavingsAccountId())
                    .orElse(null);
            
            if (account != null && account.getUserId().equals(userId)) {
                account.setBalance(account.getBalance() + expense.getAmount());
                account.setUpdatedAt(LocalDate.now());
                savingsAccountRepository.save(account);
            }
        }
        
        expenseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
