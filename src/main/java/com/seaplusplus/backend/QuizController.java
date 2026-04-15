package com.seaplusplus.backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

    private final QuizService quizService;
    private final ShopService shopService;

    public QuizController(QuizService quizService, ShopService shopService) {
        this.quizService = quizService;
        this.shopService = shopService;
    }

    @PostMapping("/api/quiz/answer")
    public Map<String, Object> submitAnswer(@RequestBody Map<String, Integer> body) {
        int questionId = body.get("questionId");
        int selectedAnswer = body.get("selectedAnswer");

        boolean correct = quizService.checkAnswer(questionId, selectedAnswer);

        if (correct) {
            quizService.addCoins(10);
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

    @PostMapping("/api/reset")
    public Map<String, Object> resetGame() {
        quizService.resetGame();
        shopService.resetGame();

        return Map.of(
            "success", true,
            "coins", quizService.getCoins()
        );
    }
}