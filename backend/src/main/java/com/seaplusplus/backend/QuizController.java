package com.seaplusplus.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
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
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @RequestHeader(value = "X-Player-Id", required = false) String playerId,
            @RequestBody Map<String, Object> body) {

        if (!PlayerIds.isValid(playerId)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing or invalid X-Player-Id header"
            ));
        }

        Integer questionId = readInt(body, "questionId");
        Integer selectedAnswer = readInt(body, "selectedAnswer");

        if (questionId == null || selectedAnswer == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing or invalid 'questionId' or 'selectedAnswer'"
            ));
        }

        if (quizService.findQuestion(questionId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Unknown questionId: " + questionId
            ));
        }

        boolean correct = quizService.checkAnswer(questionId, selectedAnswer);
        int reward = correct ? quizService.rewardFor(questionId) : 0;

        if (correct) {
            int newCoins = quizService.getCoins(playerId) + reward;
            try {
                saveService.save(playerId, newCoins, shopService.getInventory(playerId));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to persist reward, no coins awarded: " + e.getMessage()
                ));
            }
            quizService.addCoins(playerId, reward);
        }

        return ResponseEntity.ok(Map.of(
            "correct", correct,
            "reward", reward,
            "coins", quizService.getCoins(playerId)
        ));
    }

    @GetMapping("/api/coins")
    public ResponseEntity<Map<String, Object>> getCoins(
            @RequestHeader(value = "X-Player-Id", required = false) String playerId) {
        if (!PlayerIds.isValid(playerId)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing or invalid X-Player-Id header"
            ));
        }
        return ResponseEntity.ok(Map.of("coins", quizService.getCoins(playerId)));
    }

    private static Integer readInt(Map<String, Object> body, String key) {
        if (body == null) return null;
        Object v = body.get(key);
        if (v instanceof Number) return ((Number) v).intValue();
        return null;
    }
}
