package com.wealthtracker.controller;

import com.wealthtracker.model.Expense;
import com.wealthtracker.model.SavingsAccount;
import com.wealthtracker.repository.ExpenseRepository;
import com.wealthtracker.repository.SavingsAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    
    private static final Logger logger = LoggerFactory.getLogger(ExpenseController.class);

    private final ExpenseRepository expenseRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    
    public ExpenseController(ExpenseRepository expenseRepository, SavingsAccountRepository savingsAccountRepository) {
        this.expenseRepository = expenseRepository;
        this.savingsAccountRepository = savingsAccountRepository;
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(expenseRepository.findByUserId(userId));
    }
    
    @PostMapping
    public ResponseEntity<Expense> create(@RequestBody Expense expense, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        logger.info("Creating expense: {} (Amount: {})", expense.getCategory(), expense.getAmount());
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

        // Revert old expense from previous savings account if linked
        if (expense.getSavingsAccountId() != null && !expense.getSavingsAccountId().isEmpty()) {
            SavingsAccount oldAccount = savingsAccountRepository.findById(expense.getSavingsAccountId()).orElse(null);
            if (oldAccount != null && oldAccount.getUserId().equals(userId)) {
                oldAccount.setBalance(oldAccount.getBalance() + expense.getAmount());
                oldAccount.setUpdatedAt(LocalDate.now());
                savingsAccountRepository.save(oldAccount);
            }
        }

        // Deduct updated expense from new savings account if linked
        if (expenseDetails.getSavingsAccountId() != null && !expenseDetails.getSavingsAccountId().isEmpty()) {
            SavingsAccount newAccount = savingsAccountRepository.findById(expenseDetails.getSavingsAccountId()).orElse(null);
            if (newAccount != null && newAccount.getUserId().equals(userId)) {
                newAccount.setBalance(newAccount.getBalance() - expenseDetails.getAmount());
                newAccount.setUpdatedAt(LocalDate.now());
                savingsAccountRepository.save(newAccount);
            }
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
        
        logger.info("Deleting expense with ID: {}", id);
        expenseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
