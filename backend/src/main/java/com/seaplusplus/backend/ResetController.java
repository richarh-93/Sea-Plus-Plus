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
    System.out.println("⚠️  RESET ENDPOINT CALLED — IGNORED (temporarily disabled)");
    return Map.of(
        "success", true,
        "message", "Reset disabled — progress preserved",
        "coins", quizService.getCoins()
    );
}
}