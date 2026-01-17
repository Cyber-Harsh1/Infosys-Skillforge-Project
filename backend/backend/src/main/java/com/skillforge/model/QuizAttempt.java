package com.skillforge.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Use Long quizId if you want a simple reference, or @ManyToOne Quiz quiz
    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    private Integer score;
    private Integer totalQuestions;

    // ✅ This MUST be named 'timestamp' to match findByUserIdOrderByTimestampDesc
    @Column(name = "timestamp")
    private LocalDateTime timestamp = LocalDateTime.now();

    // Constructor for Service use
    public QuizAttempt(Long userId, Long quizId, Integer score, Integer totalQuestions) {
        this.userId = userId;
        this.quizId = quizId;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.timestamp = LocalDateTime.now();
    }
}