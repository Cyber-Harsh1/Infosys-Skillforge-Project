package com.skillforge.controller;

import com.skillforge.model.Material;
import com.skillforge.service.MaterialService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class MaterialController {

    private final MaterialService materialService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    // =========================
    // UPLOAD MATERIAL
    // =========================
    @PostMapping("/upload")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Material> uploadMaterial(
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            // ✅ FIXED: Changed Integer to Long
            @RequestParam("topicId") Long topicId,
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {

        Material material = new Material();
        material.setTitle(title);
        // ✅ FIXED: material.setTopicId now accepts a Long
        material.setTopicId(topicId);

        Material.MaterialType materialType =
                Material.MaterialType.valueOf(type.toUpperCase());
        material.setType(materialType);

        if (materialType != Material.MaterialType.LINK) {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path targetPath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            material.setFilePath(fileName);
            material.setFileType(materialType.name());
        }
        else {
            if (url == null || url.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            material.setLink(url);
            material.setFileType("LINK");
        }

        return ResponseEntity.ok(materialService.save(material));
    }

    // =========================
    // GET MATERIALS BY TOPIC
    // =========================
    @GetMapping("/topic/{topicId}")
    // ✅ FIXED: Changed @PathVariable Integer to Long
    public ResponseEntity<List<Material>> getByTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(materialService.findByTopicId(topicId));
    }

    // =========================
    // DELETE MATERIAL
    // =========================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // =========================
    // GET ALL MATERIALS
    // =========================
    @GetMapping
    public ResponseEntity<List<Material>> getAllMaterials() {
        return ResponseEntity.ok(materialService.findAll());
    }

    // =========================
    // DOWNLOAD MATERIAL FILE
    // =========================
    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path path = Paths.get(uploadDir).resolve(filename);
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}