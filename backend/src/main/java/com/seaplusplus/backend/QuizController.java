package com.seaplusplus.backend;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class QuizController {

    private final QuizService quizService;
    private final ShopService shopService;
    private final SaveService saveService;

    public QuizController(QuizService quizService, ShopService shopService, SaveService saveService) {
        this.quizService = quizService;
        this.shopService = shopService;
        this.saveService = saveService;
    }

    @PostMapping("/api/quiz/answer")
    public Map<String, Object> submitAnswer(@RequestBody Map<String, Integer> body) {
        int questionId = body.get("questionId");
        int selectedAnswer = body.get("selectedAnswer");

        boolean correct = quizService.checkAnswer(questionId, selectedAnswer);

        if (correct) {
            quizService.addCoins(10);
            // Save after earning coins
            saveService.save(quizService.getCoins(), shopService.getInventory());
        }

        return Map.of(
            "correct", correct,
            "coins", quizService.getCoins()
        );
    }

    @GetMapping("/api/coins")
    public Map<String, Integer> getCoins() {
        return Map.of("coins", quizService.getCoins());
    }
}