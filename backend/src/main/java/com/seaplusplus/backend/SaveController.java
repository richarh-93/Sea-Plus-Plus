package com.seaplusplus.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.*;

@RestController
public class SaveController {

    private final QuizService quizService;
    private final ShopService shopService;
    private final SaveService saveService;

    public SaveController(QuizService quizService, ShopService shopService, SaveService saveService) {
        this.quizService = quizService;
        this.shopService = shopService;
        this.saveService = saveService;
    }

    @GetMapping("/api/save/exists")
    public ResponseEntity<Map<String, Object>> saveExists(
            @RequestHeader(value = "X-Player-Id", required = false) String playerId) {
        if (!PlayerIds.isValid(playerId)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing or invalid X-Player-Id header"
            ));
        }
        return ResponseEntity.ok(Map.of("exists", saveService.exists(playerId)));
    }

    @PostMapping("/api/save")
    public ResponseEntity<Map<String, Object>> save(
            @RequestHeader(value = "X-Player-Id", required = false) String playerId) {
        if (!PlayerIds.isValid(playerId)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing or invalid X-Player-Id header"
            ));
        }
        try {
            saveService.save(playerId, quizService.getCoins(playerId), shopService.getInventory(playerId));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to write save file: " + e.getMessage()
            ));
        }
        return ResponseEntity.ok(Map.of(
            "success", true,
            "coins", quizService.getCoins(playerId),
            "inventory", shopService.getInventory(playerId)
        ));
    }
}
