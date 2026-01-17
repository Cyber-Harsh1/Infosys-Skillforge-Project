package com.skillforge.repository;

import com.skillforge.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    // This finds all topics belonging to a specific subject
    List<Topic> findBySubjectId(Long subjectId);
}