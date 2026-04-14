package com.seaplusplus.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.*;
import java.util.*;

@RestController
public class QuestionController {

    private final List<Map<String, Object>> questions;

    public QuestionController() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = getClass().getResourceAsStream("/questions.json");
        questions = mapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});
    }

    @GetMapping("/api/questions")
    public List<Map<String, Object>> getQuestions() {
        return questions;
    }
}