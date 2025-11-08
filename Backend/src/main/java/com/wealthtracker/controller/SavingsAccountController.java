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
    
    @PutMapping("/{id}")
    public ResponseEntity<SavingsAccount> update(@PathVariable String id, @RequestBody SavingsAccount account, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        SavingsAccount existingAccount = savingsAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings account not found"));
        
        if (!existingAccount.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        existingAccount.setBankName(account.getBankName());
        existingAccount.setBalance(account.getBalance());
        existingAccount.setInterestRate(account.getInterestRate());
        existingAccount.setUpdatedAt(LocalDate.now());
        
        // Encrypt account number if changed
        if (account.getAccountNumber() != null && !account.getAccountNumber().isEmpty()) {
            existingAccount.setAccountNumber(EncryptionUtil.encrypt(account.getAccountNumber()));
        }
        
        SavingsAccount updatedAccount = savingsAccountRepository.save(existingAccount);
        
        // Decrypt for response
        updatedAccount.setAccountNumber(EncryptionUtil.decrypt(updatedAccount.getAccountNumber()));
        return ResponseEntity.ok(updatedAccount);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        SavingsAccount account = savingsAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings account not found"));
        
        if (!account.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        savingsAccountRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
