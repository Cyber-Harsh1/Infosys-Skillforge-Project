package com.skillforge.service;

import com.skillforge.model.Topic;
import com.skillforge.repository.TopicRepository;
import com.skillforge.exception.TopicNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TopicService {

    private final TopicRepository repo;

    public TopicService(TopicRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Topic add(Topic topic) {
        if (topic.getSubjectId() == null || topic.getName() == null) {
            throw new IllegalArgumentException("Subject ID and Topic Name are required");
        }
        return repo.save(topic);
    }

    public List<Topic> listAll() {
        return repo.findAll();
    }

    public List<Topic> listBySubject(Long subjectId) {
        return repo.findBySubjectId(subjectId);
    }

    public Topic findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new TopicNotFoundException(id));
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new TopicNotFoundException(id);
        }
        repo.deleteById(id);
    }

    @Transactional
    public Topic update(Long id, Topic data) {
        return repo.findById(id).map(topic -> {
            if (data.getName() != null) topic.setName(data.getName());
            if (data.getContent() != null) topic.setContent(data.getContent());
            if (data.getSubjectId() != null) topic.setSubjectId(data.getSubjectId());
            if (data.getType() != null) topic.setType(data.getType());
            return repo.save(topic);
        }).orElseThrow(() -> new TopicNotFoundException(id));
    }
}
