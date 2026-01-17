package com.skillforge.controllers;

import com.skillforge.model.Subject;
import com.skillforge.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subjects")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class SubjectController {

    @Autowired
    private SubjectService service;

    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(service.listAll());
    }

    /**
     * ✅ NEW: Get subjects for a specific course
     * URL: GET http://localhost:8080/api/subjects/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Subject>> getSubjectsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(service.listByCourse(courseId));
    }

    /**
     * ✅ NEW: Get subjects for a specific instructor
     * URL: GET http://localhost:8080/api/subjects/instructor/{instructorId}
     */
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<Subject>> getSubjectsByInstructor(@PathVariable Long instructorId) {
        return ResponseEntity.ok(service.listByInstructor(instructorId));
    }

    /**
     * ✅ Add a single subject
     */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @PostMapping
    public ResponseEntity<?> addSubject(@RequestBody Subject subject) {
        try {
            Subject savedSubject = service.save(subject);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSubject);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving subject: " + e.getMessage());
        }
    }

    /**
     * ✅ Bulk add subjects
     */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @PostMapping("/bulk")
    public ResponseEntity<?> addMultipleSubjects(@RequestBody List<Subject> subjects) {
        try {
            List<Subject> savedSubjects = service.saveAll(subjects);
            return ResponseEntity.ok(savedSubjects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Bulk save failed: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok("Subject deleted successfully");
    }
}