package com.seaplusplus.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
public class QuestionController {

    @GetMapping("/api/questions")
    public List<Map<String, Object>> getQuestions() {
        List<Map<String, Object>> questions = new ArrayList<>();

        questions.add(Map.of(
            "id", 1,
            "question", "What is the correct way to declare a pointer in C++?",
            "options", List.of("int ptr;", "int *ptr;", "ptr int;", "int &ptr;"),
            "correctAnswer", 1,
            "reward", 10
        ));

        questions.add(Map.of(
            "id", 2,
            "question", "Which keyword is used to allocate memory dynamically in C++?",
            "options", List.of("malloc", "alloc", "new", "create"),
            "correctAnswer", 2,
            "reward", 10
        ));

        questions.add(Map.of(
            "id", 3,
            "question", "What does 'cout' belong to?",
            "options", List.of("stdio.h", "stdlib.h", "iostream", "string.h"),
            "correctAnswer", 2,
            "reward", 10
        ));

        return questions;
    }
}