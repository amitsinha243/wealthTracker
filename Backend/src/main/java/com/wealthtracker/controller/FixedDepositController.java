package com.wealthtracker.controller;

import com.wealthtracker.model.FixedDeposit;
import com.wealthtracker.repository.FixedDepositRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/fixed-deposits")
public class FixedDepositController {
    
    private final FixedDepositRepository fixedDepositRepository;
    
    public FixedDepositController(FixedDepositRepository fixedDepositRepository) {
        this.fixedDepositRepository = fixedDepositRepository;
    }
    
    @GetMapping
    public ResponseEntity<List<FixedDeposit>> getAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(fixedDepositRepository.findByUserId(userId));
    }
    
    @PostMapping
    public ResponseEntity<FixedDeposit> create(@RequestBody FixedDeposit deposit, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        System.out.println("UserID -> "+userId);
        deposit.setUserId(userId);

        deposit.setUpdatedAt(LocalDate.now());
        System.out.println("Deposit -> "+deposit);
        return ResponseEntity.ok(fixedDepositRepository.save(deposit));
    }
}
