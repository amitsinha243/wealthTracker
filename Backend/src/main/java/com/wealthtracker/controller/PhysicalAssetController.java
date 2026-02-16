package com.wealthtracker.controller;

import com.wealthtracker.model.PhysicalAsset;
import com.wealthtracker.repository.PhysicalAssetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/physical-assets")
public class PhysicalAssetController {

    private final PhysicalAssetRepository repository;

    public PhysicalAssetController(PhysicalAssetRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<PhysicalAsset>> getAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(repository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<PhysicalAsset> create(@RequestBody PhysicalAsset asset, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        asset.setUserId(userId);
        asset.setCreatedAt(LocalDate.now());
        asset.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(repository.save(asset));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhysicalAsset> update(@PathVariable String id, @RequestBody PhysicalAsset asset, Authentication auth) {
        String userId = (String) auth.getPrincipal();

        PhysicalAsset existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Physical asset not found"));

        if (!existing.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        existing.setAssetName(asset.getAssetName());
        existing.setAssetType(asset.getAssetType());
        existing.setPurchasePrice(asset.getPurchasePrice());
        existing.setCurrentValue(asset.getCurrentValue());
        existing.setPurchaseDate(asset.getPurchaseDate());
        existing.setDescription(asset.getDescription());
        existing.setUpdatedAt(LocalDate.now());

        return ResponseEntity.ok(repository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();

        PhysicalAsset asset = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Physical asset not found"));

        if (!asset.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
