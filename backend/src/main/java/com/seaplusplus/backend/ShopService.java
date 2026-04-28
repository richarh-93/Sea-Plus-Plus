package com.seaplusplus.backend;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.*;

@Service
public class ShopService {

    private final QuizService quizService;
    private final SaveService saveService;
    private final List<Map<String, Object>> inventory;

    private final List<Map<String, Object>> fishCatalog = List.of(
        Map.of("id", 1, "name", "Angelfish", "price", 10, "imageUrl", "angel.png"),
        Map.of("id", 2, "name", "Clownfish", "price", 20, "imageUrl", "clown.png"),
        Map.of("id", 3, "name", "Pigfish", "price", 30, "imageUrl", "pig.png"),
        Map.of("id", 4, "name", "Anglerfish", "price", 40, "imageUrl", "angler.png"),
        Map.of("id", 5, "name", "Swordfish", "price", 50, "imageUrl", "sword.png"),
        Map.of("id", 6, "name", "Mola Mola", "price", 60, "imageUrl", "molamola.png"),
        Map.of("id", 7, "name", "Spinner Shark", "price", 70, "imageUrl", "spinner.png"),
        Map.of("id", 8, "name", "Boston Lobster", "price", 80, "imageUrl", "lobsterL.png"),
        Map.of("id", 9, "name", "Densmoray Eel", "price", 100, "imageUrl", "eel.png")
    );

    @SuppressWarnings("unchecked")
    public ShopService(QuizService quizService, SaveService saveService) {
        this.quizService = quizService;
        this.saveService = saveService;

        Map<String, Object> data = saveService.load();
        Object savedInv = data.get("inventory");
        List<Map<String, Object>> saved = savedInv instanceof List
            ? (List<Map<String, Object>>) savedInv
            : new ArrayList<>();
        this.inventory = new ArrayList<>(saved);
    }

    public List<Map<String, Object>> getCatalog() {
        return fishCatalog;
    }

    public Optional<Map<String, Object>> findFish(int fishId) {
        return fishCatalog.stream()
            .filter(f -> ((Number) f.get("id")).intValue() == fishId)
            .findFirst();
    }

    public boolean owns(int fishId) {
        return inventory.stream()
            .anyMatch(f -> ((Number) f.get("id")).intValue() == fishId);
    }

    public boolean canAfford(int price) {
        return quizService.getCoins() >= price;
    }

    public void purchase(Map<String, Object> fish) throws IOException {
        int price = ((Number) fish.get("price")).intValue();

        int newCoins = quizService.getCoins() - price;
        List<Map<String, Object>> newInventory = new ArrayList<>(inventory);
        newInventory.add(fish);

        saveService.save(newCoins, newInventory);

        quizService.addCoins(-price);
        inventory.add(fish);
    }

    public List<Map<String, Object>> getInventory() {
        return inventory;
    }

    public void resetInventory() {
        inventory.clear();
    }
}
