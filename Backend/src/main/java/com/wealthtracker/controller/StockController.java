package com.wealthtracker.controller;

import com.wealthtracker.model.Stock;
import com.wealthtracker.repository.StockRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {
    
    private final StockRepository stockRepository;
    
    public StockController(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }
    
    @GetMapping
    public ResponseEntity<List<Stock>> getAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(stockRepository.findByUserId(userId));
    }
    
    @PostMapping
    public ResponseEntity<Stock> create(@RequestBody Stock stock, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        stock.setUserId(userId);
        stock.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(stockRepository.save(stock));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Stock> update(@PathVariable String id, @RequestBody Stock stock, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        Stock existingStock = stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
        
        if (!existingStock.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        existingStock.setStockName(stock.getStockName());
        existingStock.setSymbol(stock.getSymbol());
        existingStock.setQuantity(stock.getQuantity());
        existingStock.setPurchasePrice(stock.getPurchasePrice());
        existingStock.setPurchaseDate(stock.getPurchaseDate());
        existingStock.setUpdatedAt(LocalDate.now());
        
        return ResponseEntity.ok(stockRepository.save(existingStock));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
        
        if (!stock.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        stockRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
