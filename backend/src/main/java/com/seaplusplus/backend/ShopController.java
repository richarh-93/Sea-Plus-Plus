package com.seaplusplus.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.*;

@RestController
public class ShopController {

    private static final int DENSMORAY_EEL_ID = 9;

    private final ShopService shopService;
    private final QuizService quizService;

    public ShopController(ShopService shopService, QuizService quizService) {
        this.shopService = shopService;
        this.quizService = quizService;
    }

    @PostMapping("/api/fish/buy")
    public ResponseEntity<Map<String, Object>> buyFish(
            @RequestHeader(value = "X-Player-Id", required = false) String playerId,
            @RequestBody Map<String, Object> body) {

        if (!PlayerIds.isValid(playerId)) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Missing or invalid X-Player-Id header"
            ));
        }

        Object idValue = body == null ? null : body.get("fishId");
        if (!(idValue instanceof Number)) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Missing or invalid 'fishId'"
            ));
        }
        int fishId = ((Number) idValue).intValue();

        Optional<Map<String, Object>> fishOpt = shopService.findFish(fishId);
        if (fishOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "error", "Fish not found"
            ));
        }
        Map<String, Object> fish = fishOpt.get();

        if (shopService.owns(playerId, fishId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "success", false,
                "error", "You already own this fish"
            ));
        }

        if (fishId == DENSMORAY_EEL_ID && !shopService.hasAllOtherFish(playerId, fishId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "success", false,
                "error", "locked",
                "message", "You must collect every other fish before Professor Densmoray Eel will return."
            ));
        }

        int price = ((Number) fish.get("price")).intValue();
        if (!shopService.canAfford(playerId, price)) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of(
                "success", false,
                "error", "Not enough coins",
                "coins", quizService.getCoins(playerId),
                "price", price
            ));
        }

        try {
            shopService.purchase(playerId, fish);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to persist purchase, no state changed: " + e.getMessage()
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Purchased " + fish.get("name"),
            "coins", quizService.getCoins(playerId),
            "inventory", shopService.getInventory(playerId)
        ));
    }

    @GetMapping("/api/inventory")
    public ResponseEntity<?> getInventory(
            @RequestHeader(value = "X-Player-Id", required = false) String playerId) {
        if (!PlayerIds.isValid(playerId)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing or invalid X-Player-Id header"
            ));
        }
        return ResponseEntity.ok(shopService.getInventory(playerId));
    }
}
