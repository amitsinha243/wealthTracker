package com.wealthtracker.controller;

import com.wealthtracker.model.MutualFund;
import com.wealthtracker.model.MutualFundTransaction;
import com.wealthtracker.repository.MutualFundRepository;
import com.wealthtracker.repository.MutualFundTransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/mutual-funds")
public class MutualFundController {
    
    private final MutualFundRepository mutualFundRepository;
    private final MutualFundTransactionRepository transactionRepository;
    
    public MutualFundController(MutualFundRepository mutualFundRepository, 
                                MutualFundTransactionRepository transactionRepository) {
        this.mutualFundRepository = mutualFundRepository;
        this.transactionRepository = transactionRepository;
    }
    
    @GetMapping
    public ResponseEntity<List<MutualFund>> getAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(mutualFundRepository.findByUserId(userId));
    }
    
    @PostMapping
    public ResponseEntity<MutualFund> create(@RequestBody MutualFund fund, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        fund.setUserId(userId);
        fund.setUpdatedAt(LocalDate.now());
        
        MutualFund savedFund = mutualFundRepository.save(fund);
        
        // Create initial transaction
        MutualFundTransaction transaction = new MutualFundTransaction();
        transaction.setMutualFundId(savedFund.getId());
        transaction.setUserId(userId);
        transaction.setUnits(fund.getUnits());
        transaction.setNav(fund.getNav());
        transaction.setPurchaseDate(fund.getPurchaseDate());
        transactionRepository.save(transaction);
        
        return ResponseEntity.ok(savedFund);
    }
    
    @PostMapping("/{id}/add-units")
    public ResponseEntity<MutualFund> addUnits(@PathVariable String id, 
                                                @RequestBody Map<String, Object> request,
                                                Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        MutualFund fund = mutualFundRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Mutual fund not found"));
            
        if (!fund.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        Double newUnits = Double.parseDouble(request.get("units").toString());
        Double newNav = Double.parseDouble(request.get("nav").toString());
        String purchaseDateStr = request.get("purchaseDate").toString();
        LocalDate purchaseDate = LocalDate.parse(purchaseDateStr);
        
        // Calculate weighted average NAV for SIP
        Double oldUnits = fund.getUnits();
        Double oldNav = fund.getNav();
        Double totalUnits = oldUnits + newUnits;
        Double weightedAvgNav = ((oldUnits * oldNav) + (newUnits * newNav)) / totalUnits;
        
        // Update total units and weighted average NAV
        fund.setUnits(totalUnits);
        fund.setNav(Math.round(weightedAvgNav * 100.0) / 100.0); // Round to 2 decimal places
        fund.setUpdatedAt(LocalDate.now());
        
        MutualFund updatedFund = mutualFundRepository.save(fund);
        
        // Create transaction record
        MutualFundTransaction transaction = new MutualFundTransaction();
        transaction.setMutualFundId(id);
        transaction.setUserId(userId);
        transaction.setUnits(newUnits);
        transaction.setNav(newNav);
        transaction.setPurchaseDate(purchaseDate);
        transactionRepository.save(transaction);
        
        return ResponseEntity.ok(updatedFund);
    }
    
    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<MutualFundTransaction>> getTransactions(@PathVariable String id, 
                                                                        Authentication auth) {
        String userId = (String) auth.getPrincipal();
        List<MutualFundTransaction> transactions = transactionRepository.findByMutualFundId(id);
        
        // Verify ownership
        if (!transactions.isEmpty() && !transactions.get(0).getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<List<MutualFundTransaction>> getAllTransactions(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(transactionRepository.findByUserId(userId));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MutualFund> update(@PathVariable String id, @RequestBody MutualFund fund, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        MutualFund existingFund = mutualFundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mutual fund not found"));
        
        if (!existingFund.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        existingFund.setFundName(fund.getFundName());
        existingFund.setSchemeName(fund.getSchemeName());
        existingFund.setUnits(fund.getUnits());
        existingFund.setNav(fund.getNav());
        existingFund.setPurchaseDate(fund.getPurchaseDate());
        existingFund.setUpdatedAt(LocalDate.now());
        
        return ResponseEntity.ok(mutualFundRepository.save(existingFund));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        MutualFund fund = mutualFundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mutual fund not found"));
        
        if (!fund.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        // Delete associated transactions
        transactionRepository.deleteByMutualFundId(id);
        
        // Delete the fund
        mutualFundRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
