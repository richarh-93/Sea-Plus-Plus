package com.seaplusplus.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
public class FishController {

    @GetMapping("/api/fish")
    public List<Map<String, Object>> getFish() {
        List<Map<String, Object>> fish = new ArrayList<>();

        fish.add(Map.of(
            "id", 1,
            "name", "Testfish",
            "price", 25
        ));

        fish.add(Map.of(
            "id", 2,
            "name", "Clownfish",
            "price", 50
        ));

        fish.add(Map.of(
            "id", 3,
            "name", "Spinner Shark",
            "price", 75
        ));

        return fish;
    }
}