package com.skillforge.service;

import com.skillforge.model.Subject;
import com.skillforge.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository repo;

    public List<Subject> listAll() {
        return repo.findAll();
    }

    /**
     * ✅ NEW: List subjects by Course ID
     * Since Course.java no longer has a subjects list, the frontend will
     * call this method to show subjects for a specific course.
     */
    public List<Subject> listByCourse(Long courseId) {
        return repo.findByCourseId(courseId);
    }

    /**
     * ✅ Matches the Instructor-specific filtering
     */
    public List<Subject> listByInstructor(Long instructorId) {
        return repo.findByInstructorId(instructorId);
    }

    /**
     * ✅ Saves a single subject
     */
    @Transactional
    public Subject save(Subject subject) {
        return repo.save(subject);
    }

    /**
     * ✅ Handles bulk saving (useful when creating a course with multiple subjects)
     */
    @Transactional
    public List<Subject> saveAll(List<Subject> subjects) {
        return repo.saveAll(subjects);
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteById(id);
    }
}