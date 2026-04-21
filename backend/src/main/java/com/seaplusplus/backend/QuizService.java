package com.seaplusplus.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.*;

@Service
public class QuizService {

    private int coins;
    private final List<Map<String, Object>> questions;

    public QuizService(SaveService saveService) throws IOException {
        this.coins = (int) saveService.load().get("coins");

        // Load questions from file so we can check answers
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = getClass().getResourceAsStream("/questions.json");
        questions = mapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});
    }

    public int getCoins() {
        return coins;
    }

    public boolean checkAnswer(int questionId, int selectedAnswer) {
        // Find the question and compare the selected answer
        return questions.stream()
            .filter(q -> (int) q.get("id") == questionId)
            .findFirst()
            .map(q -> (int) q.get("correctAnswer") == selectedAnswer)
            .orElse(false);
    }

    public void addCoins(int amount) {
        coins += amount;
    }
}