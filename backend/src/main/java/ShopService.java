package com.seaplusplus.backend;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ShopService {

    private final QuizService quizService;
    private final SaveService saveService;
    private final List<Map<String, Object>> inventory;

    private final List<Map<String, Object>> fishCatalog = List.of(
        Map.of("id", 1, "name", "Clownfish", "price", 50, "imageUrl", "clownfish.png"),
        Map.of("id", 2, "name", "Blue Tang", "price", 75, "imageUrl", "bluetang.png"),
        Map.of("id", 3, "name", "Goldfish", "price", 25, "imageUrl", "goldfish.png")
    );

    @SuppressWarnings("unchecked")
    public ShopService(QuizService quizService, SaveService saveService) {
        this.quizService = quizService;
        this.saveService = saveService;

        // Load inventory from save file on startup
        Map<String, Object> data = saveService.load();
        List<Map<String, Object>> saved = (List<Map<String, Object>>) data.get("inventory");
        this.inventory = new ArrayList<>(saved);
    }

    public Map<String, Object> buyFish(int fishId) {
        Map<String, Object> fish = fishCatalog.stream()
            .filter(f -> (int) f.get("id") == fishId)
            .findFirst()
            .orElse(null);

        if (fish == null) {
            return Map.of("success", false, "message", "Fish not found");
        }

        int price = (int) fish.get("price");
        if (quizService.getCoins() < price) {
            return Map.of("success", false, "message", "Not enough coins");
        }

        quizService.addCoins(-price);
        inventory.add(fish);

        // Save progress after every purchase
        saveService.save(quizService.getCoins(), inventory);

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
}