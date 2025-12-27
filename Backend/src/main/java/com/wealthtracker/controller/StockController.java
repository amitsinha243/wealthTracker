package com.wealthtracker.controller;

import com.wealthtracker.model.Stock;
import com.wealthtracker.model.StockTransaction;
import com.wealthtracker.repository.StockRepository;
import com.wealthtracker.repository.StockTransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
public class StockController {
    
    private final StockRepository stockRepository;
    private final StockTransactionRepository transactionRepository;
    
    public StockController(StockRepository stockRepository, 
                          StockTransactionRepository transactionRepository) {
        this.stockRepository = stockRepository;
        this.transactionRepository = transactionRepository;
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
        
        Stock savedStock = stockRepository.save(stock);
        
        // Create initial transaction
        StockTransaction transaction = new StockTransaction();
        transaction.setStockId(savedStock.getId());
        transaction.setUserId(userId);
        transaction.setQuantity(stock.getQuantity());
        transaction.setPurchasePrice(stock.getPurchasePrice());
        transaction.setPurchaseDate(stock.getPurchaseDate());
        transactionRepository.save(transaction);
        
        return ResponseEntity.ok(savedStock);
    }
    
    @PostMapping("/{id}/add-units")
    public ResponseEntity<Stock> addUnits(@PathVariable String id, 
                                          @RequestBody Map<String, Object> request,
                                          Authentication auth) {
        String userId = (String) auth.getPrincipal();
        
        Stock stock = stockRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Stock not found"));
            
        if (!stock.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        Double newQuantity = Double.parseDouble(request.get("quantity").toString());
        Double newPrice = Double.parseDouble(request.get("purchasePrice").toString());
        String purchaseDateStr = request.get("purchaseDate").toString();
        LocalDate purchaseDate = LocalDate.parse(purchaseDateStr);
        
        // Calculate weighted average purchase price
        Double oldQuantity = stock.getQuantity();
        Double oldPrice = stock.getPurchasePrice();
        Double totalQuantity = oldQuantity + newQuantity;
        Double weightedAvgPrice = ((oldQuantity * oldPrice) + (newQuantity * newPrice)) / totalQuantity;
        
        // Update total quantity and weighted average price
        stock.setQuantity(totalQuantity);
        stock.setPurchasePrice(Math.round(weightedAvgPrice * 100.0) / 100.0); // Round to 2 decimal places
        stock.setUpdatedAt(LocalDate.now());
        
        Stock updatedStock = stockRepository.save(stock);
        
        // Create transaction record
        StockTransaction transaction = new StockTransaction();
        transaction.setStockId(id);
        transaction.setUserId(userId);
        transaction.setQuantity(newQuantity);
        transaction.setPurchasePrice(newPrice);
        transaction.setPurchaseDate(purchaseDate);
        transactionRepository.save(transaction);
        
        return ResponseEntity.ok(updatedStock);
    }
    
    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<StockTransaction>> getTransactions(@PathVariable String id, 
                                                                   Authentication auth) {
        String userId = (String) auth.getPrincipal();
        List<StockTransaction> transactions = transactionRepository.findByStockId(id);
        
        // Verify ownership
        if (!transactions.isEmpty() && !transactions.get(0).getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<List<StockTransaction>> getAllTransactions(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(transactionRepository.findByUserId(userId));
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
        
        // Delete associated transactions
        transactionRepository.deleteByStockId(id);
        
        // Delete the stock
        stockRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
