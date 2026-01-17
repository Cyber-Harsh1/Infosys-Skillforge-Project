package com.skillforge.controllers;

import com.skillforge.dto.SubjectRequestDTO;
import com.skillforge.model.Subject;
import com.skillforge.model.Course;
import com.skillforge.model.User;
import com.skillforge.service.SubjectService;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/subjects")
@CrossOrigin(origins = { "http://localhost:3001"})
public class SubjectController {

    @Autowired
    private SubjectService service;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Subject>> getSubjectsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(service.listByCourse(courseId));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<Subject>> getSubjectsByInstructor(@PathVariable Long instructorId) {
        return ResponseEntity.ok(service.listByInstructor(instructorId));
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @PostMapping
    public ResponseEntity<?> addSubject(@RequestBody SubjectRequestDTO request) {
        try {
            // Validate course
            Optional<Course> courseOpt = courseRepository.findById(request.getCourseId());
            if (courseOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Course not found with ID: " + request.getCourseId());
            }

            // Validate instructor
            Optional<User> instructorOpt = userRepository.findById(request.getInstructorId());
            if (instructorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("User not found with ID: " + request.getInstructorId());
            }

            User instructor = instructorOpt.get();
            if (!"INSTRUCTOR".equals(instructor.getRole())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("User with ID " + request.getInstructorId() + " is not an instructor");
            }

            // Create subject
            Subject subject = new Subject();
            subject.setName(request.getName());
            subject.setCourse(courseOpt.get());
            subject.setInstructor(instructor);
            subject.setDescription(request.getDescription() != null ? request.getDescription() : "");

            Subject savedSubject = service.save(subject);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSubject);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving subject: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @PostMapping("/bulk")
    public ResponseEntity<?> addMultipleSubjects(@RequestBody List<SubjectRequestDTO> requests) {
        try {
            List<Subject> subjects = new ArrayList<>();

            for (SubjectRequestDTO request : requests) {
                // Validate course
                Optional<Course> courseOpt = courseRepository.findById(request.getCourseId());
                if (courseOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Course not found with ID: " + request.getCourseId());
                }

                // Validate instructor
                Optional<User> instructorOpt = userRepository.findById(request.getInstructorId());
                if (instructorOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("User not found with ID: " + request.getInstructorId());
                }

                User instructor = instructorOpt.get();
                if (!"INSTRUCTOR".equals(instructor.getRole())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("User with ID " + request.getInstructorId() + " is not an instructor");
                }

                // Create subject
                Subject subject = new Subject();
                subject.setName(request.getName());
                subject.setCourse(courseOpt.get());
                subject.setInstructor(instructor);
                subject.setDescription(request.getDescription() != null ? request.getDescription() : "");

                subjects.add(subject);
            }

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