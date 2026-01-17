package com.skillforge.service;

import com.skillforge.model.Quiz;
import com.skillforge.model.Question;
import com.skillforge.model.QuizAttempt;
import com.skillforge.repository.QuizRepository;
import com.skillforge.repository.QuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    /** * ✅ Generates a quiz with a unique Display ID to avoid duplicates.
     * Required by QuizController.
     */
    @Transactional
    public Quiz generateAndSave(String title, Long topicId) {
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setTopicId(topicId);

        // Using UUID ensures we NEVER get a duplicate ID error in the database
        quiz.setDisplayId("QZ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        List<Question> simulatedQuestions = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Question q = new Question();
            q.setQuiz(quiz);
            q.setQuestionText("Simulated Question #" + i + " for " + title + "?");
            q.setOptionA("Option Alpha");
            q.setOptionB("Option Beta");
            q.setOptionC("Option Gamma");
            q.setOptionD("Option Delta");
            q.setCorrectOption("A");
            simulatedQuestions.add(q);
        }

        quiz.setQuestions(simulatedQuestions);
        return quizRepository.save(quiz);
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Optional<Quiz> findByDisplayId(String displayId) {
        return quizRepository.findByDisplayId(displayId);
    }

    public List<QuizAttempt> getAttemptsByUserId(Long userId) {
        // Matches the updated repository method name
        return quizAttemptRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public QuizAttempt saveAttempt(QuizAttempt attempt) {
        if (attempt.getTimestamp() == null) {
            attempt.setTimestamp(LocalDateTime.now());
        }
        return quizAttemptRepository.save(attempt);
    }

    public List<QuizAttempt> getAllAttempts() {
        return quizAttemptRepository.findAll();
    }

    public List<Quiz> getQuizzesByTopic(Long topicId) {
        return quizRepository.findByTopicId(topicId);
    }
}