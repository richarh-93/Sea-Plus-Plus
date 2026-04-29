package com.seaplusplus.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class ResetController {

    private final QuizService quizService;
    private final ShopService shopService;
    private final SaveService saveService;

    public ResetController(QuizService quizService, ShopService shopService, SaveService saveService) {
        this.quizService = quizService;
        this.shopService = shopService;
        this.saveService = saveService;
    }

    @PostMapping("/api/reset")
    public ResponseEntity<Map<String, Object>> resetGame(
            @RequestHeader(value = "X-Player-Id", required = false) String playerId) {
        if (!PlayerIds.isValid(playerId)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing or invalid X-Player-Id header"
            ));
        }

        quizService.resetCoins(playerId);
        shopService.resetInventory(playerId);

        if (!saveService.delete(playerId)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Reset in-memory state, but failed to update save file",
                "coins", quizService.getCoins(playerId),
                "inventory", shopService.getInventory(playerId)
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Game reset",
            "coins", quizService.getCoins(playerId),
            "inventory", shopService.getInventory(playerId)
        ));
    }
}
