package com.seaplusplus.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.*;

@Service
public class SaveService {

    private static final String SAVE_FILE = "saves.json";

    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, Map<String, Object>> loadAll() {
        File file = new File(SAVE_FILE);
        if (!file.exists()) {
            return new HashMap<>();
        }
        try {
            return mapper.readValue(
                    file,
                    new TypeReference<Map<String, Map<String, Object>>>() {});
        } catch (IOException e) {
            System.out.println("Error loading saves: " + e.getMessage());
            return new HashMap<>();
        }
    }

    public boolean exists(String playerId) {
        return loadAll().containsKey(playerId);
    }

    public synchronized boolean delete(String playerId) {
        Map<String, Map<String, Object>> all = loadAll();
        if (!all.containsKey(playerId)) {
            return true;
        }
        all.remove(playerId);
        try {
            writeAtomic(all);
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    public synchronized void save(String playerId, int coins, List<Map<String, Object>> inventory) throws IOException {
        Map<String, Map<String, Object>> all = loadAll();
        Map<String, Object> playerData = new HashMap<>();
        playerData.put("coins", coins);
        playerData.put("inventory", inventory);
        all.put(playerId, playerData);
        writeAtomic(all);
    }

    private void writeAtomic(Map<String, Map<String, Object>> all) throws IOException {
        Path tmp = Path.of(SAVE_FILE + ".tmp");
        mapper.writerWithDefaultPrettyPrinter().writeValue(tmp.toFile(), all);
        Files.move(tmp, Path.of(SAVE_FILE), StandardCopyOption.REPLACE_EXISTING);
    }
}
