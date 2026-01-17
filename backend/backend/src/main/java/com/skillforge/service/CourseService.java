package com.skillforge.service;

import com.skillforge.model.Course;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CourseService {

    private final CourseRepository repo;
    private final UserRepository userRepository;

    public CourseService(CourseRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
    }

    @Transactional
    public Course add(Course c) {
        if (c.getInstructor() != null && c.getInstructor().getId() != null) {
            userRepository.findById(c.getInstructor().getId())
                    .ifPresent(c::setInstructor);
        }
        return repo.save(c);
    }

    public List<Course> listAll() {
        return repo.findAll();
    }

    /**
     * ✅ Added to match updated Repository naming
     */
    public List<Course> listByInstructor(Long instructorId) {
        return repo.findByInstructor_Id(instructorId);
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteById(id);
    }
}