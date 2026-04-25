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
    public ResponseEntity<Map<String, Object>> resetGame() {
        quizService.resetCoins();
        shopService.resetInventory();

        if (!saveService.delete()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Reset in-memory state, but failed to delete save file",
                "coins", quizService.getCoins(),
                "inventory", shopService.getInventory()
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Game reset",
            "coins", quizService.getCoins(),
            "inventory", shopService.getInventory()
        ));
    }
}
