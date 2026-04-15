import initKaplay from "./kaplayCtx";
import {
    getCoins,
    getFishCatalog,
    getQuestions,
    submitAnswer,
    buyFish,
    getInventory,
    resetGame,
} from "./api";

export default function initGame() {
    const k = initKaplay();

    const state = {
        coins: 0,
        fishCatalog: [],
        questions: [],
        inventory: [],
        coinLabel: null,
        messageLabel: null,
    };

    // backgrounds
    k.loadSprite("background", "/background.png");
    k.loadSprite("startBg", "/startmenu/startmenu.png");
    k.loadSprite("shopBg", "/shopmenu/nobuttons.png");
    k.loadSprite("questionBg", "/questionmenu/questionbackground.png");

    // buttons
    k.loadSprite("startButton", "/startmenu/startbutton.png");
    k.loadSprite("shopButton", "/shopbutton.png");
    k.loadSprite("coinButton", "/coinbutton.png");
    k.loadSprite("backButton", "/shopmenu/left.png");
    k.loadSprite("nextButton", "/shopmenu/right.png");
    k.loadSprite("cart","/shopmenu/cart.png");

    // fish
    k.loadSprite("testfish", "/testerfish.png", {
        sliceX: 3,
        anims: {
            swim: {
                from: 0,
                to: 1, //the 2nd index pic is with its mouth open
                loop: true,
                speed: 6,
            },
        },
    });

    k.onLoad(async () => {
        //functions:
        function addFullBackground(name) {
            k.add([
                k.sprite(name),
                k.pos(0, 0),
                k.scale(8),
            ]);
        }

        function makeButton(name, x, y, onClickFn, scaleNum = 8) {
            const btn = k.add([
                k.sprite(name),
                k.pos(x, y),
                k.anchor("center"),
                k.area(),
                k.scale(scaleNum),
            ]);

            btn.onHover(() => {
                k.setCursor("pointer");
            });

            btn.onHoverEnd(() => {
                k.setCursor("default");
            });

            btn.onClick(() => {
                onClickFn();
            });

            return btn;
        }

        function addCoinUI() {
            state.coinLabel = k.add([
                k.text(`Coin Balance: ${state.coins}`, { size: 36 }),
                k.pos(k.width()-40, k.height()-40),
                k.anchor("botright"),
                k.fixed(),
                k.z(100),
                k.color(0,0,0),
            ]);

            state.coinLabel.onUpdate(() => {
                state.coinLabel.text = `Coin Balance: ${state.coins}`;
            });
        }

        function addMessageUI() {
            state.messageLabel = k.add([
                k.text("", { size: 28 }),
                k.pos(40, 90),
                k.fixed(),
                k.z(100),
                k.color(0,0,0),
            ]);
        }

        function addHUD() {
            addCoinUI();
            addMessageUI();
        }

        function setMessage(msg) {
            if (!state.messageLabel) return;
            state.messageLabel.text = msg;

            k.wait(2, () => {
                if (state.messageLabel && state.messageLabel.text === msg) {
                    state.messageLabel.text = "";
                }
            });
        }

        function spawnOwnedFish(index) {
            const fish = k.add([
                k.sprite("testfish"),
                k.pos(150 + index * 120, 300 + (index % 3) * 120),
                k.scale(6),
            ]);
            fish.play("swim");

            let speed = 120;
            let dirX = 1;

            const amplitude = 40 + Math.random() * 30;
            const frequency = 1 + Math.random();
            const baseY = fish.pos.y;

            // your sprite faces left by default
            fish.flipX = dirX === 1;

            fish.onUpdate(() => {
                fish.move(speed * dirX, 0);

                fish.pos.y = baseY + Math.sin(k.time() * frequency) * amplitude;

                if (fish.pos.x > k.width() - fish.width*8) {
                    dirX = -1;
                }

                if (fish.pos.x < 0) {
                    dirX = 1;
                }

                fish.flipX = dirX === 1;
            });
        }

        function addInventoryFishToMainScene() {
            for (let i = 0; i < state.inventory.length; i++) {
                spawnOwnedFish(i);
            }

            if (state.inventory.length === 0) {
                // fallback test fish so your aquarium is not empty
                spawnOwnedFish(0);
            }
        }

        function addShopItems(items, startX = 550, startY = 568) {
            const spacingX = 408;
            const spacingY = 308;

            items.forEach((fish, i) => {
                const col = i % 4;
                const row = Math.floor(i / 4);

                const x = startX + col * spacingX;
                const y = startY + row * spacingY;

                const cart = k.add([
                    k.sprite("cart"),
                    k.pos(x, y),
                    k.anchor("center"),
                    k.area(),
                    k.scale(8),
                ]);

                k.add([
                    k.text(fish.name, { size: 24 }),
                    k.pos(x, y - 95),
                    k.anchor("center"),
                    k.color(0,0,0),
                ]);

                k.add([
                    k.text(`${fish.price} coins`, { size: 22 }),
                    k.pos(x, y + 80),
                    k.anchor("center"),
                    k.color(0,0,0),
                ]);

                cart.onHover(() => {
                    k.setCursor("pointer");
                });

                cart.onHoverEnd(() => {
                    k.setCursor("default");
                });

                cart.onClick(async () => {
                    try {
                        const result = await buyFish(fish.id);

                        if (result.success) {
                            state.coins = result.coins;
                            state.inventory = result.inventory;
                            setMessage(`Bought ${fish.name}`);
                        } else {
                            setMessage(result.message ?? "Purchase failed");
                        }
                    } catch (err) {
                        setMessage("Could not reach backend");
                        console.error(err);
                    }
                });
            });
        }

        function addQuestionItems() {
            const questions = state.questions.slice(0, 3);

            if (questions.length === 0) {
                k.add([
                    k.text("No questions loaded", { size: 36 }),
                    k.pos(k.width() / 2, k.height() / 2),
                    k.anchor("center"),
                    k.color(0,0,0),
                ]);
                return;
            }

            questions.forEach((q, qIndex) => {
                const baseX = 220;
                const baseY = 220 + qIndex * 260;

                k.add([
                    k.text(`Q${qIndex + 1}: ${q.question}`, {
                        size: 28,
                        width: 1500,
                    }),
                    k.pos(baseX, baseY),
                    k.color(0,0,0),
                ]);

                q.options.forEach((option, optionIndex) => {
                    const btn = k.add([
                        k.text(`${optionIndex + 1}. ${option}`, {
                            size: 24,
                            width: 1200,
                        }),
                        k.pos(baseX + 40, baseY + 70 + optionIndex * 42),
                        k.area(),
                        k.color(0,0,0),
                    ]);

                    btn.onHover(() => {
                        k.setCursor("pointer");
                    });

                    btn.onHoverEnd(() => {
                        k.setCursor("default");
                    });

                    btn.onClick(async () => {
                        try {
                            const result = await submitAnswer(q.id, optionIndex);
                            state.coins = result.coins;
                            setMessage(result.correct ? "Correct! Coins added." : "Wrong answer.");
                        } catch (err) {
                            setMessage("Could not submit answer");
                            console.error(err);
                        }
                    });
                });
            });
        }

        // initial backend load
        try {
            const coinsData = await getCoins();
            state.coins = coinsData.coins;
        } catch (err) {
            console.error("Coins failed:", err);
        }

        try {
            const fishData = await getFishCatalog();
            state.fishCatalog = fishData;
        } catch (err) {
            console.error("Fish catalog failed:", err);
        }

        try {
            const questionsData = await getQuestions();
            state.questions = questionsData;
            console.log("Loaded questions:", questionsData);
        } catch (err) {
            console.error("Questions failed:", err);
        }

        try {
            const inventoryData = await getInventory();
            state.inventory = inventoryData;
        } catch (err) {
            console.error("Inventory failed:", err);
        }

        //scenes: 
        
        k.scene("start", () => {
            addFullBackground("startBg");
            addHUD();

            makeButton("startButton", 1024, 580, async () => {
                try {
                    await resetGame();

                    state.coins = 0;
                    state.inventory = [];

                    const fishData = await getFishCatalog();
                    state.fishCatalog = fishData;

                    const questionsData = await getQuestions();
                    state.questions = questionsData;

                    k.go("main");
                } catch (err) {
                    console.error("Reset failed:", err);
                    setMessage("Could not reset game");
                }
            });

            // makeButton("creditsButton",1024, 800, () => {
            //     k.go("credits");
            // });
        });

        k.scene("main", () => {
            addFullBackground("background");
            addHUD();

            addInventoryFishToMainScene();
            makeButton("shopButton", k.width()-90, 90, () => {
                k.go("shop");
            }, 4);

            makeButton("coinButton", 90, 90, () => {
                k.go("question");
            }, 4);
        });

        k.scene("shop", () => {
            addFullBackground("shopBg");
            addHUD();

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

            makeButton("nextButton", k.width()-240, 191, () => {
                k.go("shop2");
            });

            addShopItems(state.fishCatalog.slice(0, 8));

        });

        k.scene("shop2", () => {
            addFullBackground("shopBg");
            addHUD();

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

            makeButton("backButton", k.width()-400, 191, () => {
                k.go("shop");
            });

            makeButton("nextButton", k.width()-240, 191, () => {
                k.go("shop3");
            });

            addShopItems(state.fishCatalog.slice(8, 16));
        });

        k.scene("shop3", () => {
            addFullBackground("shopBg");
            addHUD();

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

            makeButton("backButton", k.width()-400, 191, () => {
                k.go("shop2");
            });

            addShopItems(state.fishCatalog.slice(16, 24));
        });

        k.scene("question", () => {
            addFullBackground("questionBg");
            addHUD();

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

            addQuestionItems();
        });

        k.go("start");
    });
}