package com.wealthtracker.controller;

import com.wealthtracker.model.SavingsAccount;
import com.wealthtracker.repository.SavingsAccountRepository;
import com.wealthtracker.util.EncryptionUtil;
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
        List<SavingsAccount> accounts = savingsAccountRepository.findByUserId(userId);
        accounts.forEach(account -> {
            if (account.getAccountNumber() != null && !account.getAccountNumber().isEmpty()) {
                account.setAccountNumber(EncryptionUtil.decrypt(account.getAccountNumber()));
            }
        });
        return ResponseEntity.ok(accounts);
    }
    
    @PostMapping
    public ResponseEntity<SavingsAccount> create(@RequestBody SavingsAccount account, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        account.setUserId(userId);
        account.setUpdatedAt(LocalDate.now());
        
        // Encrypt account number before saving
        if (account.getAccountNumber() != null && !account.getAccountNumber().isEmpty()) {
            account.setAccountNumber(EncryptionUtil.encrypt(account.getAccountNumber()));
        }
        
        SavingsAccount savedAccount = savingsAccountRepository.save(account);
        
        // Decrypt for response
        savedAccount.setAccountNumber(EncryptionUtil.decrypt(savedAccount.getAccountNumber()));
        return ResponseEntity.ok(savedAccount);
    }
}
