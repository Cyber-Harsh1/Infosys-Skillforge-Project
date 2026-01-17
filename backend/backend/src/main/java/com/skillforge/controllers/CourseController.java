package com.skillforge.controller;

import com.skillforge.model.Course;
import com.skillforge.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courses")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.listAll());
    }

    /**
     * ✅ NEW: Get courses by Instructor ID
     * URL: GET http://localhost:8080/api/courses/instructor/{id}
     */
    @GetMapping("/instructor/{instructorId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<Course>> getByInstructor(@PathVariable Long instructorId) {
        return ResponseEntity.ok(courseService.listByInstructor(instructorId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> addCourse(@RequestBody Course course) {
        try {
            Course savedCourse = courseService.add(course);
            return ResponseEntity.status(201).body(savedCourse);
        } catch (Exception e) {
            e.printStackTrace(); // Helps debug in console
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}