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
            "name", "Clownfish",
            "price", 50,
            "imageUrl", "clownfish.png"
        ));

        fish.add(Map.of(
            "id", 2,
            "name", "Blue Tang",
            "price", 75,
            "imageUrl", "bluetang.png"
        ));

        fish.add(Map.of(
            "id", 3,
            "name", "Goldfish",
            "price", 25,
            "imageUrl", "goldfish.png"
        ));

        return fish;
    }
}