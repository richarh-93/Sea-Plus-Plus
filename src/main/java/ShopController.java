// Controller receives request from react and pulls out fishID, then hands it to ShopService
package com.seaplusplus.backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @PostMapping("/api/fish/buy")
    public Map<String, Object> buyFish(@RequestBody Map<String, Integer> body) {
        int fishId = body.get("fishId");
        return shopService.buyFish(fishId);
    }

    @GetMapping("/api/inventory")
    public List<Map<String, Object>> getInventory() {
        return shopService.getInventory();
    }
}