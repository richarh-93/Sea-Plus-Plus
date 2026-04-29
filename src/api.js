const API_BASE = "";
const PLAYER_ID_KEY = "spp.playerId";

function getOrCreatePlayerId() {
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
}

function playerIdHeaders() {
    return { "X-Player-Id": getOrCreatePlayerId() };
}

async function handleJson(res) {
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}

export async function getCoins() {
    const res = await fetch(`${API_BASE}/api/coins`, {
        headers: playerIdHeaders(),
    });
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

    const questions = await res.json();

    return shuffleArray(questions);
}

export async function submitAnswer(questionId, selectedAnswer) {
    const res = await fetch(`${API_BASE}/api/quiz/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...playerIdHeaders() },
        body: JSON.stringify({ questionId, selectedAnswer }),
    });
    return handleJson(res);
}

export async function buyFish(fishId) {
    const res = await fetch(`${API_BASE}/api/fish/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...playerIdHeaders() },
        body: JSON.stringify({ fishId }),
    });
    return handleJson(res);
}

export async function getInventory() {
    const res = await fetch(`${API_BASE}/api/inventory`, {
        headers: playerIdHeaders(),
    });
    return handleJson(res);
}

export async function resetGame() {
    const res = await fetch(`${API_BASE}/api/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...playerIdHeaders() },
    });
    return res.json();
}

function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}
