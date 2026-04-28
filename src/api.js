const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function handleJson(res) {
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}

export async function getCoins() {
    const res = await fetch(`${API_BASE}/api/coins`);
    return handleJson(res);
}

export async function getFishCatalog() {
    const res = await fetch(`${API_BASE}/api/fish`);
    return handleJson(res);
}

export async function getQuestions(category) {
    const url = category
        ? `${API_BASE}/api/questions?category=${category}`
        : `${API_BASE}/api/questions`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("Failed to fetch questions");
    }

    return await res.json();
}

export async function submitAnswer(questionId, selectedAnswer) {
    const res = await fetch(`${API_BASE}/api/quiz/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, selectedAnswer }),
    });
    return handleJson(res);
}

export async function buyFish(fishId) {
    const res = await fetch(`${API_BASE}/api/fish/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fishId }),
    });
    return handleJson(res);
}

export async function getInventory() {
    const res = await fetch(`${API_BASE}/api/inventory`);
    return handleJson(res);
}

export async function resetGame() {
    const res = await fetch(`${API_BASE}/api/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    return res.json();
}

export async function addCoins(amount) {
    const res = await fetch(`${API_BASE}/api/coins/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
    });
    return handleJson(res);
}