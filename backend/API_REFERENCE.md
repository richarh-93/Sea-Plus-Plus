# Sea Plus Plus — Backend API Reference

**Base URL:** `http://localhost:8080`

Make sure the Spring Boot backend is running before making requests from the React frontend.

---

## Configuration

The following keys live in `src/main/resources/application.properties`:

| Key                     | Default | Purpose                                                  |
|-------------------------|---------|----------------------------------------------------------|
| `game.starting-coins`   | `0`     | Coin balance used when no save file exists or after reset |
| `game.reward.easy`      | `5`     | Coins awarded per correct **easy** question              |
| `game.reward.medium`    | `10`    | Coins awarded per correct **medium** question            |
| `game.reward.hard`      | `20`    | Coins awarded per correct **hard** question              |

---

## Conventions

- All responses are JSON.
- Error responses include an `error` (or `message`) field describing the failure.
- Success responses for state-mutating endpoints include the post-operation state where useful (`coins`, `inventory`).
- For state-mutating endpoints, the backend persists the post-operation state to `save.json` **before** committing the in-memory change. If the save fails, the operation is rejected with `500` and no in-memory state changes — the client can safely retry.

### Status codes used

| Code | Meaning in this API                                            |
|------|----------------------------------------------------------------|
| 200  | Request handled successfully                                   |
| 400  | Malformed/missing request body fields                          |
| 402  | Insufficient coins for a purchase                              |
| 404  | Referenced entity (questionId, fishId) not found               |
| 409  | Conflict with current state (e.g. fish already owned)          |
| 500  | Save persistence failed; no in-memory state changed            |

---

## Endpoints

### GET /api/fish

Returns all fish available for purchase in the shop.

**Status:** `200 OK`

**Response:**

```json
[
  { "id": 1, "name": "Clownfish", "price": 50, "imageUrl": "clownfish.png" },
  { "id": 2, "name": "Blue Tang", "price": 75, "imageUrl": "bluetang.png" },
  { "id": 3, "name": "Goldfish",  "price": 25, "imageUrl": "goldfish.png" }
]
```

**React example:**

```javascript
const [fish, setFish] = useState([]);

useEffect(() => {
  fetch("http://localhost:8080/api/fish")
    .then(res => res.json())
    .then(data => setFish(data));
}, []);
```

---

### GET /api/questions

Returns all C++ quiz questions (currently 40 questions, mixing **easy**, **medium**, and **hard** difficulty across multiple categories).

The answer-key field (`correctAnswer`) is **deliberately not exposed**. Each question's `options` are shuffled server-side at startup, and the indices stay stable for the lifetime of the server process — the index you submit to `POST /api/quiz/answer` must match the order you received here.

**Status:** `200 OK`

**Response (one entry shown):**

```json
[
  {
    "id": 1,
    "question": "What is the correct way to declare a pointer in C++?",
    "options": ["int &ptr;", "int *ptr;", "ptr int;", "int ptr;"],
    "difficulty": "easy",
    "category": "Pointers",
    "reward": 5
  }
]
```

**Field reference:**

| Field        | Type     | Notes                                                      |
|--------------|----------|------------------------------------------------------------|
| `id`         | int      | Stable identifier of the question                          |
| `question`   | string   | The prompt to show the player                              |
| `options`    | string[] | Answer choices, shuffled per server start                  |
| `difficulty` | string   | One of `"easy"`, `"medium"`, `"hard"`                      |
| `category`   | string   | Topic label (e.g. `"Pointers"`, `"OOP"`, `"STL"`)          |
| `reward`     | int      | Coins awarded on correct answer (derived from difficulty)  |

---

### POST /api/quiz/answer

Submit an answer to a quiz question. On a correct answer, awards coins (scaled by difficulty) and persists progress.

**Request body:**

```json
{
  "questionId": 1,
  "selectedAnswer": 1
}
```

**Status: `200 OK` — correct answer**

```json
{ "correct": true, "reward": 5, "coins": 55 }
```

**Status: `200 OK` — wrong answer**

```json
{ "correct": false, "reward": 0, "coins": 50 }
```

**Status: `400 Bad Request` — missing/invalid fields**

```json
{ "error": "Missing or invalid 'questionId' or 'selectedAnswer'" }
```

**Status: `404 Not Found` — unknown questionId**

```json
{ "error": "Unknown questionId: 999" }
```

**Status: `500 Internal Server Error` — save persistence failed**

No coins are awarded; client may retry.

```json
{ "error": "Failed to persist reward, no coins awarded: <details>" }
```

**React example:**

```javascript
const submitAnswer = async (questionId, selectedAnswer) => {
  const res = await fetch("http://localhost:8080/api/quiz/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, selectedAnswer })
  });
  const data = await res.json();
  // data.correct → true/false
  // data.reward  → coins earned this round (0 if wrong)
  // data.coins   → updated coin balance
};
```

---

### GET /api/coins

Returns the player's current coin balance.

**Status:** `200 OK`

```json
{ "coins": 50 }
```

---

### POST /api/fish/buy

Purchase a fish from the shop. Deducts coins and adds the fish to inventory.

**Request body:**

```json
{ "fishId": 1 }
```

**Status: `200 OK` — purchase succeeded**

```json
{
  "success": true,
  "message": "Purchased Clownfish",
  "coins": 25,
  "inventory": [
    { "id": 1, "name": "Clownfish", "price": 50, "imageUrl": "clownfish.png" }
  ]
}
```

**Status: `400 Bad Request` — missing/invalid fishId**

```json
{ "success": false, "error": "Missing or invalid 'fishId'" }
```

**Status: `404 Not Found` — fish not in catalog**

```json
{ "success": false, "error": "Fish not found" }
```

**Status: `409 Conflict` — already owned**

```json
{ "success": false, "error": "You already own this fish" }
```

**Status: `402 Payment Required` — insufficient coins**

```json
{ "success": false, "error": "Not enough coins", "coins": 10, "price": 50 }
```

**Status: `500 Internal Server Error` — save persistence failed**

```json
{ "success": false, "error": "Failed to persist purchase, no state changed: <details>" }
```

**React example:**

```javascript
const buyFish = async (fishId) => {
  const res = await fetch("http://localhost:8080/api/fish/buy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fishId })
  });
  const data = await res.json();
  // res.status → 200 / 400 / 402 / 404 / 409 / 500
  // data.coins → remaining coins (on success)
  // data.inventory → updated inventory list (on success)
};
```

---

### GET /api/inventory

Returns the player's currently owned fish.

**Status:** `200 OK`

```json
[
  { "id": 3, "name": "Goldfish",  "price": 25, "imageUrl": "goldfish.png" },
  { "id": 1, "name": "Clownfish", "price": 50, "imageUrl": "clownfish.png" }
]
```

---

### GET /api/save/exists

Reports whether a save file is present on disk. Use this on app start to decide whether to show a "Continue" or "New Game" path.

**Status:** `200 OK`

```json
{ "exists": true }
```

---

### POST /api/save

Manually persist the current in-memory state (`coins` + `inventory`) to `save.json`. State-mutating endpoints already auto-save, so this is mostly useful for explicit "Save Game" buttons.

**Status: `200 OK` — save succeeded**

```json
{
  "success": true,
  "coins": 45,
  "inventory": [
    { "id": 1, "name": "Clownfish", "price": 50, "imageUrl": "clownfish.png" }
  ]
}
```

**Status: `500 Internal Server Error` — could not write file**

```json
{ "success": false, "message": "Failed to write save file: <details>" }
```

---

### POST /api/reset

Resets the game: clears in-memory coins and inventory in `QuizService` / `ShopService`, **and deletes** `save.json`. After this call, `GET /api/save/exists` will return `false` and the player's coin balance returns to `game.starting-coins` from `application.properties`.

**Status: `200 OK` — reset succeeded**

```json
{
  "success": true,
  "message": "Game reset",
  "coins": 0,
  "inventory": []
}
```

**Status: `500 Internal Server Error` — save file could not be deleted**

In-memory state was still reset; the file just couldn't be removed.

```json
{
  "success": false,
  "message": "Reset in-memory state, but failed to delete save file",
  "coins": 0,
  "inventory": []
}
```

---

## Quick Reference

| Method | Endpoint              | Purpose                                       |
|--------|-----------------------|-----------------------------------------------|
| GET    | /api/fish             | List shop fish                                |
| GET    | /api/questions        | List quiz questions (no `correctAnswer`)      |
| POST   | /api/quiz/answer      | Submit answer, earn coins (by difficulty)     |
| GET    | /api/coins            | Check coin balance                            |
| POST   | /api/fish/buy         | Buy a fish                                    |
| GET    | /api/inventory        | List owned fish                               |
| GET    | /api/save/exists      | Check whether `save.json` exists              |
| POST   | /api/save             | Manually persist current state                |
| POST   | /api/reset            | Clear in-memory state and delete `save.json`  |

---

## Running the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Server starts on `http://localhost:8080`. CORS is configured to allow requests from `http://localhost:3000` (React dev server).
