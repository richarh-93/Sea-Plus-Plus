package com.seaplusplus.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.*;

@Service
public class SaveService {

    private static final String SAVE_FILE = "save.json";

    private final ObjectMapper mapper = new ObjectMapper();

    public boolean exists() {
        return new File(SAVE_FILE).exists();
    }

    public boolean delete() {
        File file = new File(SAVE_FILE);
        return !file.exists() || file.delete();
    }

    public void save(int coins, List<Map<String, Object>> inventory) throws IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("coins", coins);
        data.put("inventory", inventory);

        mapper.writerWithDefaultPrettyPrinter()
              .writeValue(new File(SAVE_FILE), data);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> load() {
        File file = new File(SAVE_FILE);

        if (!file.exists()) {
            return Map.of("inventory", new ArrayList<>());
        }

        try {
            return mapper.readValue(file, Map.class);
        } catch (IOException e) {
            System.out.println("Error loading: " + e.getMessage());
            return Map.of("inventory", new ArrayList<>());
        }
    }
}
