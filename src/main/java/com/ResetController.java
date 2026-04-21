package com.seaplusplus.backend;

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
    public Map<String, Object> resetGame() {
        // Reset coins to 0
        int currentCoins = quizService.getCoins();
        quizService.addCoins(-currentCoins);

        // Clear inventory
        shopService.getInventory().clear();

        // Save the reset state
        saveService.save(0, new ArrayList<>());

        return Map.of(
            "success", true,
            "message", "Game reset",
            "coins", 0
        );
    }
}