package com.seaplusplus.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QuizService {

    private final int startingCoins;
    private final int easyReward;
    private final int mediumReward;
    private final int hardReward;

    private final List<Map<String, Object>> questions;
    private final Map<String, Integer> coinsByPlayer = new ConcurrentHashMap<>();

    public QuizService(
            SaveService saveService,
            @Value("${game.starting-coins:0}") int startingCoins,
            @Value("${game.reward.easy:5}") int easyReward,
            @Value("${game.reward.medium:10}") int mediumReward,
            @Value("${game.reward.hard:20}") int hardReward
    ) throws IOException {
        this.startingCoins = startingCoins;
        this.easyReward = easyReward;
        this.mediumReward = mediumReward;
        this.hardReward = hardReward;

        for (var entry : saveService.loadAll().entrySet()) {
            if (entry.getValue().get("coins") instanceof Number n) {
                coinsByPlayer.put(entry.getKey(), n.intValue());
            }
        }

        ObjectMapper mapper = new ObjectMapper();
        InputStream is = getClass().getResourceAsStream("/questions.json");
        List<Map<String, Object>> raw = mapper.readValue(
                is, new TypeReference<List<Map<String, Object>>>() {});
        this.questions = shuffleAllOptions(raw);
    }

    private List<Map<String, Object>> shuffleAllOptions(List<Map<String, Object>> source) {
        Random rng = new Random();
        List<Map<String, Object>> result = new ArrayList<>(source.size());
        for (Map<String, Object> q : source) {
            @SuppressWarnings("unchecked")
            List<Object> opts = new ArrayList<>((List<Object>) q.get("options"));
            int correctIdx = ((Number) q.get("correctAnswer")).intValue();
            Object correctValue = opts.get(correctIdx);
            Collections.shuffle(opts, rng);
            int newCorrectIdx = opts.indexOf(correctValue);

            Map<String, Object> shuffled = new LinkedHashMap<>(q);
            shuffled.put("options", opts);
            shuffled.put("correctAnswer", newCorrectIdx);
            shuffled.put("reward", rewardForDifficulty((String) q.get("difficulty")));
            result.add(shuffled);
        }
        return result;
    }

    public int getCoins(String playerId) {
        return coinsByPlayer.getOrDefault(playerId, startingCoins);
    }

    public List<Map<String, Object>> getQuestions() {
        return questions;
    }

    public List<Map<String, Object>> getQuestionsByCategory(String category) {
        return questions.stream()
                .filter(q -> category.equals(q.get("category")))
                .toList();
    }

    public Set<String> getCategories() {
        Set<String> result = new LinkedHashSet<>();
        for (Map<String, Object> q : questions) {
            if (q.get("category") instanceof String s) {
                result.add(s);
            }
        }
        return result;
    }

    public Optional<Map<String, Object>> findQuestion(int questionId) {
        return questions.stream()
                .filter(q -> ((Number) q.get("id")).intValue() == questionId)
                .findFirst();
    }

    public boolean checkAnswer(int questionId, int selectedAnswer) {
        return findQuestion(questionId)
                .map(q -> ((Number) q.get("correctAnswer")).intValue() == selectedAnswer)
                .orElse(false);
    }

    public int rewardFor(int questionId) {
        return findQuestion(questionId)
                .map(q -> rewardForDifficulty((String) q.get("difficulty")))
                .orElse(0);
    }

    public int rewardForDifficulty(String difficulty) {
        if (difficulty == null) return mediumReward;
        switch (difficulty.toLowerCase()) {
            case "easy":   return easyReward;
            case "hard":   return hardReward;
            case "medium":
            default:       return mediumReward;
        }
    }

    public void addCoins(String playerId, int amount) {
        coinsByPlayer.compute(playerId, (k, v) -> (v == null ? startingCoins : v) + amount);
    }

    public void resetCoins(String playerId) {
        coinsByPlayer.put(playerId, startingCoins);
    }
}
