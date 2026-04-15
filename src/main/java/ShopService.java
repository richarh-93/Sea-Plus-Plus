//Handles the buying logic and tracks the player's inventory
package com.seaplusplus.backend;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ShopService {

    private final QuizService quizService;
    private final List<Map<String, Object>> inventory = new ArrayList<>();

    // Spring Boot automatically "injects" QuizService here
    // so ShopService can access the player's coin balance
    public ShopService(QuizService quizService) {
        this.quizService = quizService;
    }

    // All available fish and their prices
    private final List<Map<String, Object>> fishCatalog = List.of(
        Map.of("id", 1, "name", "Clownfish", "price", 50, "imageUrl", "clownfish.png"),
        Map.of("id", 2, "name", "Blue Tang", "price", 75, "imageUrl", "bluetang.png"),
        Map.of("id", 3, "name", "Goldfish", "price", 25, "imageUrl", "goldfish.png")
    );

    public Map<String, Object> buyFish(int fishId) {
        // Step 1: Find the fish in our catalog
        Map<String, Object> fish = fishCatalog.stream()
            .filter(f -> (int) f.get("id") == fishId)
            .findFirst()
            .orElse(null);

        if (fish == null) {
            return Map.of("success", false, "message", "Fish not found");
        }

        // Step 2: Check if player can afford it
        int price = (int) fish.get("price");
        if (quizService.getCoins() < price) {
            return Map.of("success", false, "message", "Not enough coins");
        }

        // Step 3: Deduct coins and add fish to inventory
        quizService.addCoins(-price);
        inventory.add(fish);

        return Map.of(
            "success", true,
            "message", "Purchased " + fish.get("name"),
            "coins", quizService.getCoins(),
            "inventory", inventory
        );
    }

    public List<Map<String, Object>> getInventory() {
        return inventory;
    }

    public void resetGame() {
        inventory.clear();
    }
}