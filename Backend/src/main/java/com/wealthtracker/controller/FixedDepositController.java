package com.wealthtracker.controller;

import com.wealthtracker.model.FixedDeposit;
import com.wealthtracker.model.SavingsAccount;
import com.wealthtracker.repository.FixedDepositRepository;
import com.wealthtracker.repository.SavingsAccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/fixed-deposits")
public class FixedDepositController {
    
    private final FixedDepositRepository fixedDepositRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    
    public FixedDepositController(FixedDepositRepository fixedDepositRepository, SavingsAccountRepository savingsAccountRepository) {
        this.fixedDepositRepository = fixedDepositRepository;
        this.savingsAccountRepository = savingsAccountRepository;
    }
    
    @GetMapping
    public ResponseEntity<List<FixedDeposit>> getAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        List<FixedDeposit> deposits = fixedDepositRepository.findByUserId(userId);
        
        // Process pending RD deductions for all RDs with linked accounts
        for (FixedDeposit deposit : deposits) {
            if ("RD".equals(deposit.getDepositType()) && deposit.getSavingsAccountId() != null) {
                processRDDeductions(deposit, userId);
            }
        }
        
        return ResponseEntity.ok(fixedDepositRepository.findByUserId(userId));
    }
    
    private void processRDDeductions(FixedDeposit deposit, String userId) {
        LocalDate startDate = deposit.getStartDate() != null ? deposit.getStartDate() : deposit.getCreatedAt();
        LocalDate lastDeduction = deposit.getLastDeductionDate();
        LocalDate now = LocalDate.now();
        LocalDate maturityDate = deposit.getMaturityDate();
        
        // Start from the first month of RD or the month after last deduction
        LocalDate processFrom = lastDeduction != null ? 
            lastDeduction.plusMonths(1).withDayOfMonth(1) : 
            startDate.withDayOfMonth(1);
        
        // Process all pending months up to current month or maturity (whichever is earlier)
        LocalDate processUntil = now.isBefore(maturityDate) ? now : maturityDate;
        
        if (processFrom.isAfter(processUntil)) {
            return; // No deductions to process
        }
        
        SavingsAccount savingsAccount = savingsAccountRepository.findById(deposit.getSavingsAccountId()).orElse(null);
        if (savingsAccount == null || !savingsAccount.getUserId().equals(userId)) {
            return; // Account not found or doesn't belong to user
        }
        
        int monthsToDeduct = 0;
        LocalDate currentMonth = processFrom;
        while (!currentMonth.isAfter(processUntil.withDayOfMonth(1))) {
            monthsToDeduct++;
            currentMonth = currentMonth.plusMonths(1);
        }
        
        if (monthsToDeduct > 0) {
            double totalDeduction = deposit.getAmount() * monthsToDeduct;
            savingsAccount.setBalance(savingsAccount.getBalance() - totalDeduction);
            savingsAccount.setUpdatedAt(LocalDate.now());
            savingsAccountRepository.save(savingsAccount);
            
            // Update last deduction date
            deposit.setLastDeductionDate(processUntil.withDayOfMonth(1));
            deposit.setUpdatedAt(LocalDate.now());
            fixedDepositRepository.save(deposit);
        }
    }
    
    @PostMapping
    public ResponseEntity<FixedDeposit> create(@RequestBody FixedDeposit deposit, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        System.out.println("UserID -> "+userId);
        deposit.setUserId(userId);
        deposit.setUpdatedAt(LocalDate.now());
        
        // For RD with linked account, process first month deduction
        if ("RD".equals(deposit.getDepositType()) && deposit.getSavingsAccountId() != null) {
            SavingsAccount savingsAccount = savingsAccountRepository.findById(deposit.getSavingsAccountId()).orElse(null);
            if (savingsAccount != null && savingsAccount.getUserId().equals(userId)) {
                // Deduct first installment
                savingsAccount.setBalance(savingsAccount.getBalance() - deposit.getAmount());
                savingsAccount.setUpdatedAt(LocalDate.now());
                savingsAccountRepository.save(savingsAccount);
                
                // Set last deduction date to start date's month
                LocalDate startDate = deposit.getStartDate() != null ? deposit.getStartDate() : LocalDate.now();
                deposit.setLastDeductionDate(startDate.withDayOfMonth(1));
            }
        }
        
        System.out.println("Deposit -> "+deposit);
        return ResponseEntity.ok(fixedDepositRepository.save(deposit));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FixedDeposit> update(@PathVariable String id, @RequestBody FixedDeposit deposit, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        FixedDeposit existingDeposit = fixedDepositRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fixed deposit not found"));
        
        if (!existingDeposit.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        existingDeposit.setBankName(deposit.getBankName());
        existingDeposit.setAmount(deposit.getAmount());
        existingDeposit.setInterestRate(deposit.getInterestRate());
        existingDeposit.setMaturityDate(deposit.getMaturityDate());
        existingDeposit.setDepositType(deposit.getDepositType());
        existingDeposit.setStartDate(deposit.getStartDate());
        existingDeposit.setSavingsAccountId(deposit.getSavingsAccountId());
        existingDeposit.setUpdatedAt(LocalDate.now());
        
        return ResponseEntity.ok(fixedDepositRepository.save(existingDeposit));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        FixedDeposit deposit = fixedDepositRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fixed deposit not found"));
        
        if (!deposit.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        fixedDepositRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
