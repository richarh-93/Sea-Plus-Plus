package com.seaplusplus.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
public class QuestionController {

    private static final List<String> CLIENT_FIELDS =
            List.of("id", "question", "options", "difficulty", "category", "reward");

    private final QuizService quizService;

    public QuestionController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/api/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestions() {
        List<Map<String, Object>> safe = new ArrayList<>();
        for (Map<String, Object> q : quizService.getQuestions()) {
            Map<String, Object> projection = new LinkedHashMap<>();
            for (String field : CLIENT_FIELDS) {
                if (q.containsKey(field)) {
                    projection.put(field, q.get(field));
                }
            }
            safe.add(projection);
        }
        return ResponseEntity.ok(safe);
    }
}
