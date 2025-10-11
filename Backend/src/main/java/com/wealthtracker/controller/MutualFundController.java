package com.wealthtracker.controller;

import com.wealthtracker.model.MutualFund;
import com.wealthtracker.repository.MutualFundRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/mutual-funds")
public class MutualFundController {
    
    private final MutualFundRepository mutualFundRepository;
    
    public MutualFundController(MutualFundRepository mutualFundRepository) {
        this.mutualFundRepository = mutualFundRepository;
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
        return ResponseEntity.ok(mutualFundRepository.save(fund));
    }
}
