package com.seaplusplus.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.*;

@RestController
public class ShopController {

    private final ShopService shopService;
    private final QuizService quizService;

    public ShopController(ShopService shopService, QuizService quizService) {
        this.shopService = shopService;
        this.quizService = quizService;
    }

    @PostMapping("/api/fish/buy")
    public ResponseEntity<Map<String, Object>> buyFish(@RequestBody Map<String, Object> body) {
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

        if (shopService.owns(fishId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "success", false,
                "error", "You already own this fish"
            ));
        }

        int price = ((Number) fish.get("price")).intValue();
        if (!shopService.canAfford(price)) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of(
                "success", false,
                "error", "Not enough coins",
                "coins", quizService.getCoins(),
                "price", price
            ));
        }

        try {
            shopService.purchase(fish);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to persist purchase, no state changed: " + e.getMessage()
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Purchased " + fish.get("name"),
            "coins", quizService.getCoins(),
            "inventory", shopService.getInventory()
        ));
    }

    @GetMapping("/api/inventory")
    public ResponseEntity<List<Map<String, Object>>> getInventory() {
        return ResponseEntity.ok(shopService.getInventory());
    }
}
