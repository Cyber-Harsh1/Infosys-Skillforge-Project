package com.skillforge.repository;

import com.skillforge.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * ✅ FIX: Use 'findByInstructor_Id' or 'findByInstructorId'
     * but ensure the Course entity's field is 'instructor' and User's field is 'id'.
     * Spring Boot 3 is very strict about this.
     */
    List<Course> findByInstructor_Id(Long instructorId);

    List<Course> findByDifficulty(String difficulty);

    List<Course> findByTitleContainingIgnoreCase(String keyword);

    List<Course> findByDuration(String duration);
}