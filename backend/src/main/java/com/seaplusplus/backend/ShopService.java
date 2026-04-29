package com.seaplusplus.backend;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ShopService {

    private final QuizService quizService;
    private final SaveService saveService;
    private final Map<String, List<Map<String, Object>>> inventoryByPlayer = new ConcurrentHashMap<>();

    private final List<Map<String, Object>> fishCatalog = List.of(
        Map.of("id", 1, "name", "Angelfish", "price", 5, "imageUrl", "angel.png"),
        Map.of("id", 2, "name", "Clownfish", "price", 10, "imageUrl", "clown.png"),
        Map.of("id", 3, "name", "Pigfish", "price", 15, "imageUrl", "pig.png"),
        Map.of("id", 4, "name", "Anglerfish", "price", 20, "imageUrl", "angler.png"),
        Map.of("id", 5, "name", "Swordfish", "price", 30, "imageUrl", "sword.png"),
        Map.of("id", 6, "name", "Mola Mola", "price", 40, "imageUrl", "molamola.png"),
        Map.of("id", 7, "name", "Spinner Shark", "price", 50, "imageUrl", "spinner.png"),
        Map.of("id", 8, "name", "Boston Lobster", "price", 70, "imageUrl", "lobsterL.png"),
        Map.of("id", 9, "name", "Densmoray Eel", "price", 100, "imageUrl", "eel.png")
    );

    @SuppressWarnings("unchecked")
    public ShopService(QuizService quizService, SaveService saveService) {
        this.quizService = quizService;
        this.saveService = saveService;

        for (var entry : saveService.loadAll().entrySet()) {
            Object savedInv = entry.getValue().get("inventory");
            if (savedInv instanceof List<?>) {
                List<Map<String, Object>> inv = new ArrayList<>((List<Map<String, Object>>) savedInv);
                inventoryByPlayer.put(entry.getKey(), inv);
            }
        }
    }

    public List<Map<String, Object>> getCatalog() {
        return fishCatalog;
    }

    public Optional<Map<String, Object>> findFish(int fishId) {
        return fishCatalog.stream()
            .filter(f -> ((Number) f.get("id")).intValue() == fishId)
            .findFirst();
    }

    public boolean owns(String playerId, int fishId) {
        return getInventory(playerId).stream()
            .anyMatch(f -> ((Number) f.get("id")).intValue() == fishId);
    }

    public boolean canAfford(String playerId, int price) {
        return quizService.getCoins(playerId) >= price;
    }

    public void purchase(String playerId, Map<String, Object> fish) throws IOException {
        int price = ((Number) fish.get("price")).intValue();

        int newCoins = quizService.getCoins(playerId) - price;
        List<Map<String, Object>> currentInv = getInventory(playerId);
        List<Map<String, Object>> newInventory = new ArrayList<>(currentInv);
        newInventory.add(fish);

        saveService.save(playerId, newCoins, newInventory);

        quizService.addCoins(playerId, -price);
        inventoryByPlayer.computeIfAbsent(playerId, k -> new ArrayList<>()).add(fish);
    }

    public List<Map<String, Object>> getInventory(String playerId) {
        return inventoryByPlayer.getOrDefault(playerId, new ArrayList<>());
    }

    public void resetInventory(String playerId) {
        inventoryByPlayer.remove(playerId);
    }
}
