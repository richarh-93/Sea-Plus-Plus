# Sea Plus Plus — Backend API Reference

**Base URL:** `http://localhost:8080`

Make sure the Spring Boot backend is running before making requests from the React frontend.

---

## Endpoints

### GET /api/fish

Returns all fish available for purchase in the shop.

**Response:**

```json
[
  { "id": 1, "name": "Testfish", "price": 25 },
  { "id": 2, "name": "Clownfish", "price": 50 },
  { "id": 3, "name": "Spinner Shark", "price": 75}
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

Returns all C++ quiz questions (currently 15 questions).

**Response:**

```json
[
  {
    "id": 1,
    "question": "What is the correct way to declare a pointer in C++?",
    "options": ["int ptr;", "int *ptr;", "ptr int;", "int &ptr;"],
    "correctAnswer": 1,
    "reward": 10
  }
]
```

**Notes:**
- `correctAnswer` is the zero-based index of the correct option
- `reward` is the number of coins earned for a correct answer

**React example:**

```javascript
const [questions, setQuestions] = useState([]);

useEffect(() => {
  fetch("http://localhost:8080/api/questions")
    .then(res => res.json())
    .then(data => setQuestions(data));
}, []);
```

---

### POST /api/quiz/answer

Submit an answer to a quiz question. Awards coins if correct.

**Request body:**

```json
{
  "questionId": 1,
  "selectedAnswer": 1
}
```

**Response (correct answer):**

```json
{ "correct": true, "coins": 10 }
```

**Response (wrong answer):**

```json
{ "correct": false, "coins": 0 }
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
  // data.coins → updated coin balance
};
```

---

### GET /api/coins

Returns the player's current coin balance.

**Response:**

```json
{ "coins": 50 }
```

---

### POST /api/fish/buy

Purchase a fish from the shop. Deducts coins and adds the fish to inventory.

**Request body:**

```json
{
  "fishId": 1
}
```

**Response (success):**

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

**Response (not enough coins):**

```json
{ "success": false, "message": "Not enough coins" }
```

**Response (invalid fish):**

```json
{ "success": false, "message": "Fish not found" }
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
  // data.success → true/false
  // data.message → status message
  // data.coins → remaining coins (if success)
  // data.inventory → updated inventory list (if success)
};
```

---

### GET /api/inventory

Returns the player's currently owned fish.

**Response:**

```json
[
  { "id": 3, "name": "Goldfish", "price": 25, "imageUrl": "goldfish.png" },
  { "id": 1, "name": "Clownfish", "price": 50, "imageUrl": "clownfish.png" }
]
```

---

## Quick Reference

| Method | Endpoint           | Purpose                        |
|--------|--------------------|--------------------------------|
| GET    | /api/fish          | List shop fish                 |
| GET    | /api/questions     | List quiz questions            |
| POST   | /api/quiz/answer   | Submit answer, earn coins      |
| GET    | /api/coins         | Check coin balance             |
| POST   | /api/fish/buy      | Buy a fish                     |
| GET    | /api/inventory     | List owned fish                |

---

## Running the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Server starts on `http://localhost:8080`. CORS is configured to allow requests from `http://localhost:3000` (React dev server).
