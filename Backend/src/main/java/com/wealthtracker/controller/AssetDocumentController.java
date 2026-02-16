package com.wealthtracker.controller;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.wealthtracker.model.AssetDocument;
import com.wealthtracker.repository.AssetDocumentRepository;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/physical-assets/{assetId}/documents")
public class AssetDocumentController {

    private final AssetDocumentRepository documentRepository;
    private final GridFsOperations gridFsOperations;

    public AssetDocumentController(AssetDocumentRepository documentRepository, GridFsOperations gridFsOperations) {
        this.documentRepository = documentRepository;
        this.gridFsOperations = gridFsOperations;
    }

    @GetMapping
    public ResponseEntity<List<AssetDocument>> getDocuments(@PathVariable String assetId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(documentRepository.findByPhysicalAssetIdAndUserId(assetId, userId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetDocument> uploadDocument(
            @PathVariable String assetId,
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {

        String userId = (String) auth.getPrincipal();

        // Store file in GridFS
        ObjectId gridFsId = gridFsOperations.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType()
        );

        // Save metadata
        AssetDocument doc = new AssetDocument();
        doc.setPhysicalAssetId(assetId);
        doc.setUserId(userId);
        doc.setFileName(file.getOriginalFilename());
        doc.setContentType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setGridFsFileId(gridFsId.toString());
        doc.setUploadedAt(LocalDateTime.now());

        return ResponseEntity.ok(documentRepository.save(doc));
    }

    @GetMapping("/{docId}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable String assetId,
            @PathVariable String docId,
            Authentication auth) throws IOException {

        String userId = (String) auth.getPrincipal();

        AssetDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!doc.getUserId().equals(userId) || !doc.getPhysicalAssetId().equals(assetId)) {
            return ResponseEntity.status(403).build();
        }

        GridFSFile gridFsFile = gridFsOperations.findOne(
                new Query(Criteria.where("_id").is(new ObjectId(doc.getGridFsFileId())))
        );

        if (gridFsFile == null) {
            return ResponseEntity.notFound().build();
        }

        GridFsResource resource = gridFsOperations.getResource(gridFsFile);
        byte[] content = resource.getInputStream().readAllBytes();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(content);
    }

    @DeleteMapping("/{docId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String assetId,
            @PathVariable String docId,
            Authentication auth) {

        String userId = (String) auth.getPrincipal();

        AssetDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!doc.getUserId().equals(userId) || !doc.getPhysicalAssetId().equals(assetId)) {
            return ResponseEntity.status(403).build();
        }

        // Delete from GridFS
        gridFsOperations.delete(new Query(Criteria.where("_id").is(new ObjectId(doc.getGridFsFileId()))));

        // Delete metadata
        documentRepository.deleteById(docId);

        return ResponseEntity.ok().build();
    }
}
