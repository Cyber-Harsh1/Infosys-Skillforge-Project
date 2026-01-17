package com.skillforge.controller;

import com.skillforge.model.*;
import com.skillforge.service.QuizService;
import com.skillforge.dto.QuizRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
// Note: CORS is also handled globally in SecurityConfig, but this local one is fine.
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class QuizController {

    @Autowired
    private QuizService quizService;

    // =========================================================================
    // INSTRUCTOR & ADMIN ENDPOINTS
    // =========================================================================

    /** ✅ GET all quizzes for the management table */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    /** ✅ AI Generation Endpoint */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @PostMapping("/generate")
    public ResponseEntity<?> createQuiz(@RequestBody QuizRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().length() < 5) {
            return ResponseEntity.badRequest().body("Title must be at least 5 characters.");
        }
        if (request.getTopicId() == null) {
            return ResponseEntity.badRequest().body("Topic selection is required.");
        }
        return ResponseEntity.ok(quizService.generateAndSave(request.getTitle(), request.getTopicId()));
    }

    /** ✅ GET all student attempts (For the Instructor Reports Page) */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @GetMapping("/attempts")
    public ResponseEntity<List<QuizAttempt>> getAllAttempts() {
        return ResponseEntity.ok(quizService.getAllAttempts());
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<Quiz>> getQuizzesByTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(quizService.getQuizzesByTopic(topicId));
    }

    // =========================================================================
    // STUDENT & PUBLIC ENDPOINTS
    // =========================================================================

    /** ✅ GET all available quizzes for the Student Lobby */
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Quiz>> getQuizzesForStudents() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    /** ✅ Get Quiz by Public Display ID (Used by TakeQuiz.jsx) */
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    @GetMapping("/public/{displayId}")
    public ResponseEntity<Quiz> getPublicQuiz(@PathVariable String displayId) {
        return quizService.findByDisplayId(displayId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** ✅ Submit Quiz Score after completion */
    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping("/submit-attempt")
    public ResponseEntity<?> submitAttempt(@RequestBody QuizAttempt attempt) {
        if (attempt.getScore() == null || attempt.getTotalQuestions() == null) {
            return ResponseEntity.badRequest().body("Score and total questions are required.");
        }
        if (attempt.getScore() > attempt.getTotalQuestions()) {
            return ResponseEntity.badRequest().body("Invalid score data: Score cannot exceed total questions.");
        }
        return ResponseEntity.ok(quizService.saveAttempt(attempt));
    }

    /** * ✅ FIXED: Get history for a specific student
     * This now matches the getAttemptsByUserId method in QuizService
     */
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    @GetMapping("/user-attempts/{userId}")
    public ResponseEntity<List<QuizAttempt>> getUserAttempts(@PathVariable Long userId) {
        List<QuizAttempt> attempts = quizService.getAttemptsByUserId(userId);
        return ResponseEntity.ok(attempts);
    }
}