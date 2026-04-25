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
    public ResponseEntity<Map<String, Object>> saveExists() {
        return ResponseEntity.ok(Map.of("exists", saveService.exists()));
    }

    @PostMapping("/api/save")
    public ResponseEntity<Map<String, Object>> save() {
        try {
            saveService.save(quizService.getCoins(), shopService.getInventory());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to write save file: " + e.getMessage()
            ));
        }
        return ResponseEntity.ok(Map.of(
            "success", true,
            "coins", quizService.getCoins(),
            "inventory", shopService.getInventory()
        ));
    }
}
