package com.skillforge.service;

import com.skillforge.model.Subject;
import com.skillforge.model.Course;
import com.skillforge.model.User;
import com.skillforge.repository.SubjectRepository;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository repo;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Subject> listAll() {
        return repo.findAll();
    }

    public List<Subject> listByCourse(Long courseId) {
        return repo.findByCourseId(courseId);
    }

    public List<Subject> listByInstructor(Long instructorId) {
        return repo.findByInstructorId(instructorId);
    }

    @Transactional
    public Subject save(Subject subject) {
        return repo.save(subject);
    }

    @Transactional
    public List<Subject> saveAll(List<Subject> subjects) {
        return repo.saveAll(subjects);
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteById(id);
    }
}