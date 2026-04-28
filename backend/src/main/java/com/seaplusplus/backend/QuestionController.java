package com.seaplusplus.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
public class QuestionController {

    private static final List<String> CLIENT_FIELDS =
            List.of("id", "question", "options", "difficulty", "category", "topic", "reward");

    private final QuizService quizService;

    public QuestionController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/api/questions")
    public ResponseEntity<?> getQuestions(@RequestParam(required = false) String category) {
        List<Map<String, Object>> source;
        if (category == null) {
            source = quizService.getQuestions();
        } else if (quizService.getCategories().contains(category)) {
            source = quizService.getQuestionsByCategory(category);
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Unknown category: " + category,
                "available", quizService.getCategories()
            ));
        }

        List<Map<String, Object>> safe = new ArrayList<>();
        for (Map<String, Object> q : source) {
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

    @GetMapping("/api/categories")
    public ResponseEntity<Set<String>> getCategories() {
        return ResponseEntity.ok(quizService.getCategories());
    }
}
