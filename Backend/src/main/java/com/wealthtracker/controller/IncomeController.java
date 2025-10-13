package com.wealthtracker.controller;

import com.wealthtracker.model.Income;
import com.wealthtracker.repository.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    @Autowired
    private IncomeRepository incomeRepository;

    @GetMapping
    public ResponseEntity<List<Income>> getAllIncomes(Authentication authentication) {
        String userId = authentication.getName();
        List<Income> incomes = incomeRepository.findByUserId(userId);
        return ResponseEntity.ok(incomes);
    }

    @PostMapping
    public ResponseEntity<Income> createIncome(@RequestBody Income income, Authentication authentication) {
        String userId = authentication.getName();
        income.setUserId(userId);
        Income savedIncome = incomeRepository.save(income);
        return ResponseEntity.ok(savedIncome);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable String id, Authentication authentication) {
        String userId = authentication.getName();
        Income income = incomeRepository.findById(id).orElse(null);
        
        if (income != null && income.getUserId().equals(userId)) {
            incomeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        
        return ResponseEntity.notFound().build();
    }
}
