package com.seaplusplus.backend;

import org.springframework.stereotype.Service;

@Service
public class QuizService {

    private int coins = 0;

    public int getCoins() {
        return coins;
    }

    public boolean checkAnswer(int questionId, int selectedAnswer) {
        // Match against our hardcoded correct answers
        switch (questionId) {
            case 1: return selectedAnswer == 1;
            case 2: return selectedAnswer == 2;
            case 3: return selectedAnswer == 2;
            default: return false;
        }
    }

    public void addCoins(int amount) {
        coins += amount;
    }
}