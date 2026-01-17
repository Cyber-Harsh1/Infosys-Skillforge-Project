package com.skillforge.controller;

import com.skillforge.model.Topic;
import com.skillforge.service.TopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/topics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TopicController {

    private final TopicService service;

    public TopicController(TopicService service) {
        this.service = service;
    }

    // ADD TOPIC
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @PostMapping
    public ResponseEntity<?> addTopic(@RequestBody Topic topic) {
        if (topic.getSubjectId() == null || topic.getName() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Subject ID and Topic Name are required"));
        }
        return ResponseEntity.status(201).body(service.add(topic));
    }

    // GET ALL TOPICS
    @PreAuthorize("hasAnyAuthority('STUDENT','INSTRUCTOR','ADMIN')")
    @GetMapping
    public ResponseEntity<List<Topic>> getAllTopics() {
        return ResponseEntity.ok(service.listAll());
    }

    // GET TOPICS BY SUBJECT
    @PreAuthorize("hasAnyAuthority('STUDENT','INSTRUCTOR','ADMIN')")
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Topic>> getTopicsBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(service.listBySubject(subjectId));
    }

    // DELETE TOPIC
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
