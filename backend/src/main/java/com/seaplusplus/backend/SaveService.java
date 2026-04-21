package com.seaplusplus.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.*;

@Service
public class SaveService {

    // Path to the save file — sits in your backend folder
    private static final String SAVE_FILE = "save.json";

    // Jackson's ObjectMapper converts between Java objects and JSON
    private final ObjectMapper mapper = new ObjectMapper();

    public void save(int coins, List<Map<String, Object>> inventory) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("coins", coins);
            data.put("inventory", inventory);

            // Write to file with nice formatting
            mapper.writerWithDefaultPrettyPrinter()
                  .writeValue(new File(SAVE_FILE), data);

            System.out.println("Progress saved!");
        } catch (IOException e) {
            System.out.println("Error saving: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> load() {
        File file = new File(SAVE_FILE);

        // If no save file exists, return defaults
        if (!file.exists()) {
            return Map.of(
                "coins", 0,
                "inventory", new ArrayList<>()
            );
        }

        try {
            Map<String, Object> data = mapper.readValue(file, Map.class);
            System.out.println("Progress loaded!");
            return data;
        } catch (IOException e) {
            System.out.println("Error loading: " + e.getMessage());
            return Map.of(
                "coins", 0,
                "inventory", new ArrayList<>()
            );
        }
    }
}