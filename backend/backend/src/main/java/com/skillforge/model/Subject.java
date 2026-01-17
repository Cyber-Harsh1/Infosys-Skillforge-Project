package com.skillforge.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "subjects")
@Data // Generates getters, setters, toString, equals, and hashCode
@NoArgsConstructor
@AllArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * ✅ The Relationship
     * Even if Course.java doesn't have a List<Subject>, this Subject still
     * needs to know which Course it belongs to.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * ✅ Instructor Reference
     * Kept as a Long to match your SubjectService logic.
     */
    @Column(name = "instructor_id")
    private Long instructorId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Custom constructor for easier object creation
    public Subject(String name, Course course, Long instructorId) {
        this.name = name;
        this.course = course;
        this.instructorId = instructorId;
    }
}