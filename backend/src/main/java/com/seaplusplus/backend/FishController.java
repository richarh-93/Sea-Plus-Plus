package com.seaplusplus.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
public class FishController {

    private final ShopService shopService;

    public FishController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping("/api/fish")
    public ResponseEntity<List<Map<String, Object>>> getFish() {
        return ResponseEntity.ok(shopService.getCatalog());
    }
}
