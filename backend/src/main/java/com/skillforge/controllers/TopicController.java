package com.skillforge.controller;

import com.skillforge.model.Topic;
import com.skillforge.model.Subject;
import com.skillforge.service.TopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/topics")
@CrossOrigin(origins = {"http://localhost:3001"})
public class TopicController {

    private final TopicService service;

    public TopicController(TopicService service) {
        this.service = service;
    }

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    public ResponseEntity<?> uploadTopic(
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        if (name == null || subjectId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name and Subject ID are required"));
        }

        Topic topic = new Topic();
        topic.setName(name);
        topic.setType(type);

        if (file != null && !file.isEmpty()) {
            // Save file and set path
            // topic.setContent(fileService.save(file));
        } else {
            topic.setContent(content);
        }

        return ResponseEntity.status(201).body(service.add(topic));
    }
    // --- EXISTING ENDPOINTS ---

    @PreAuthorize("hasAnyAuthority('STUDENT','INSTRUCTOR','ADMIN')")
    @GetMapping
    public ResponseEntity<List<Topic>> getAllTopics() {
        return ResponseEntity.ok(service.listAll());
    }

    @PreAuthorize("hasAnyAuthority('STUDENT','INSTRUCTOR','ADMIN')")
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Topic>> getTopicsBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(service.listBySubject(subjectId));
    }

    @PreAuthorize("hasAnyAuthority('STUDENT','INSTRUCTOR','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopicById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}