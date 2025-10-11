package com.wealthtracker.controller;

import com.wealthtracker.model.SavingsAccount;
import com.wealthtracker.repository.SavingsAccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/savings-accounts")
public class SavingsAccountController {
    
    private final SavingsAccountRepository savingsAccountRepository;
    
    public SavingsAccountController(SavingsAccountRepository savingsAccountRepository) {
        this.savingsAccountRepository = savingsAccountRepository;
    }
    
    @GetMapping
    public ResponseEntity<List<SavingsAccount>> getAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(savingsAccountRepository.findByUserId(userId));
    }
    
    @PostMapping
    public ResponseEntity<SavingsAccount> create(@RequestBody SavingsAccount account, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        account.setUserId(userId);
        account.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(savingsAccountRepository.save(account));
    }
}
