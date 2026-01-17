package com.skillforge.repository;

import com.skillforge.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    /**
     * ✅ Finds subjects assigned to a specific instructor.
     */
    List<Subject> findByInstructorId(Long instructorId);

    /**
     * ✅ NEW: Finds all subjects belonging to a specific course.
     * Since Subject has a 'Course course' field, Spring JPA follows the
     * link to the Course's ID automatically.
     */
    List<Subject> findByCourseId(Long courseId);

    /**
     * ✅ NEW: Finds subjects for an instructor within a specific course.
     */
    List<Subject> findByInstructorIdAndCourseId(Long instructorId, Long courseId);
}