import initKaplay from "./kaplayCtx";
import {
    getCoins,
    getFishCatalog,
    getQuestions,
    submitAnswer,
    buyFish,
    getInventory,
    resetGame,
    addCoins,
} from "./api";

export default function initGame() {
    const k = initKaplay();

    const state = {
        coins: 0,
        questionIndex: 0,
        fishCatalog: [],
        questions: [],
        inventory: [],
        coinLabel: null,
        messageLabel: null,
    };

    // backgrounds
    k.loadSprite("background", "/background.png");
    k.loadSprite("startBg", "/startmenu/nobuttons.png");
    k.loadSprite("shopBg", "/shopmenu/justanks.png");
    k.loadSprite("questionBg", "/questionmenu/questionbackground.png");

    // buttons
    k.loadSprite("startButton", "/startmenu/startbutton.png");
    k.loadSprite("creditsButton", "/startmenu/creditsbutton.png");
    k.loadSprite("shopButton", "/shopbutton.png");
    k.loadSprite("coinButton", "/coinbutton.png");
    k.loadSprite("backButton", "/shopmenu/left.png");
    k.loadSprite("nextButton", "/shopmenu/right.png");
    k.loadSprite("cart", "/shopmenu/cart.png");
    k.loadSprite("sanddollar", "/sanddollar.png");
    k.loadSprite("bal", "balance.png");

    // fish
    k.loadSprite("testfish", "/fish/testerfish.png", {
        sliceX: 3,
        anims: {
            swim: {
                from: 0,
                to: 1,
                loop: true,
                speed: 6,
            },
        },
    });

    k.loadSprite("clown", "/fish/clown.png", {
        sliceX: 4,
        anims: {
            swim: {
                from: 0,
                to: 3,
                loop: true,
                speed: 6,
            },
        },
    });

    k.loadSprite("spinner", "/fish/spinner.png", {
        sliceX: 4,
        anims: {
            swim: {
                from: 0,
                to: 3,
                loop: true,
                speed: 9,
            },
        },
    });

    k.onLoad(async () => {
        function getFishSpriteName(fishName) {
            if (fishName === "Testfish") return "testfish";
            if (fishName === "Clownfish") return "clown";
            if (fishName === "Spinner Shark") return "spinner";
            return "testfish";
        }

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
            const uiX = k.width()/2;
            const uiY = 60;

            // balance background box sprite
            k.add([
                k.sprite("bal"),
                k.pos(uiX, uiY),
                k.anchor("center"),
                k.fixed(),
                k.scale(6),
                k.z(99),
            ]);

            // sanddollar sprite
            k.add([
                k.sprite("sanddollar"),
                k.pos(uiX - 85, uiY),
                k.anchor("center"),
                k.fixed(),
                k.scale(4),
                k.z(100),
            ]);

            // coin number text
            state.coinLabel = k.add([
                k.text(`${state.coins}`, { size: 36 }),
                k.pos(uiX-20, uiY),
                k.anchor("left"),
                k.fixed(),
                k.z(100),
                k.color(0, 0, 0),
            ]);

            state.coinLabel.onUpdate(() => {
                state.coinLabel.text = `${state.coins}`;
            });
        }

        function addMessageUI() {
            state.messageLabel = k.add([
                k.text("", { size: 40 }),
                k.pos(k.width()/2,200),
                k.anchor("center"),
                k.fixed(),
                k.z(100),
                k.color(0, 0, 0), //color for adding, rgb for changing later
            ]);
        }

        function addHUD() {
            addCoinUI();
            addMessageUI();
        }

        function setMessage(msg, color = k.rgb(0, 0, 0)) {
            if (!state.messageLabel) return;

            state.messageLabel.text = msg;
            state.messageLabel.color = color;

            k.wait(2, () => {
                if (state.messageLabel && state.messageLabel.text === msg) {
                    state.messageLabel.text = "";
                }
            });
        }

        function spawnOwnedFish(fishData, index) {
            const spriteName = getFishSpriteName(fishData.name);

            //spawn in random locations
            const x = k.rand(120, k.width() - 120);
            const y = k.rand(220, k.height() - 120);

            const fish = k.add([
                k.sprite(spriteName),
                k.pos(x, y),
                k.scale(6),
            ]);

            fish.play("swim");

            let speed = 120;
            let dirX = Math.random() < 0.5 ? -1 : 1;

            const amplitude = 40 + Math.random() * 30;
            const frequency = 1 + Math.random();
            const baseY = fish.pos.y;

            fish.flipX = dirX === 1;

            fish.onUpdate(() => {
                fish.move(speed * dirX, 0);

                fish.pos.y = baseY + Math.sin(k.time() * frequency) * amplitude;

                if (fish.pos.x > k.width() - fish.width * 6) {
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
                spawnOwnedFish(state.inventory[i], i);
            }

            // // test by spawning fish on default
            // if (state.inventory.length === 0) {
            //     spawnOwnedFish({ name: "Testfish" }, 0);
            // }
        }

        function addShopItems(items, startX = 550, startY = 568) {
            const spacingX = 408;
            const spacingY = 308;

            items.forEach((fish, i) => {
                const col = i % 4;
                const row = Math.floor(i / 4);

                const x = startX + col * spacingX;
                const y = startY + row * spacingY;

                // check if already owned
                const alreadyOwned = state.inventory.some(f => f.name === fish.name);

                // fish sprite
                const fishSprite = k.add([
                    k.sprite(getFishSpriteName(fish.name)),
                    k.pos(x - 200, y - 30),
                    k.anchor("center"),
                    k.scale(4),
                    k.area(),
                ]);
                fishSprite.frame = 0;

                fishSprite.onHover(() => {
                    fishSprite.play("swim");
                });

                fishSprite.onHoverEnd(() => {
                    fishSprite.stop();
                    fishSprite.frame = 0;
                });

                // name label (always visible)
                k.add([
                    k.text(fish.name, { size: 50 }),
                    k.pos(x-200, y - 200),
                    k.anchor("center"),
                    k.color(0, 0, 0),
                ]);

                // ONLY show cart + price if NOT owned
                if (!alreadyOwned) {
                    const priceLabel = k.add([
                        k.text(`${fish.price}`, { size: 50 }),
                        k.pos(x, y - 90),
                        k.anchor("right"),
                        k.color(0, 0, 0),
                    ]);

                    const priceIcon = k.add([
                        k.sprite("sanddollar"),
                        k.pos(x + 10, y - 90),
                        k.anchor("left"),
                        k.scale(2),
                    ])

                    const cart = k.add([
                        k.sprite("cart"),
                        k.pos(x, y),
                        k.anchor("center"),
                        k.area(),
                        k.scale(8),
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

                                //setMessage(`Bought ${fish.name}`);

                                // remove immediately
                                cart.destroy();
                                priceLabel.destroy();
                                priceIcon.destroy();
                            } else {
                                // flash red
                                priceLabel.color = k.rgb(255, 0, 0);

                                // return to normal after 1 second
                                k.wait(1, () => {
                                    priceLabel.color = k.rgb(0, 0, 0);
                                });                            
                            }
                        } catch (err) {
                            setMessage("Could not reach backend", k.rgb(255, 0, 0));
                            console.error(err);
                        }
                    });

                } 
                //else {
                //    
                //     k.add([
                //         k.text("Owned", { size: 22 }),
                //         k.pos(x, y),
                //         k.anchor("center"),
                //         k.color(0, 150, 0),
                //     ]);
                // }
            });
        }

        function addQuestionItems() {
            if (state.questions.length === 0) {
                k.add([
                    k.text("No questions loaded", { size: 36 }),
                    k.pos(k.width() / 2, k.height() / 2),
                    k.anchor("center"),
                    k.color(0, 0, 0),
                ]);
                return;
            }

            const q = state.questions[state.questionIndex];

            const baseX = 220;
            const baseY = 300;

            // QUESTION TEXT
            k.add([
                k.text(`${q.question}`, {
                    size: 50,
                    width: 1500,
                }),
                k.pos(baseX, baseY),
                k.color(0, 0, 0),
            ]);

            // ANSWERS
            q.options.forEach((option, optionIndex) => {
                const btn = k.add([
                    k.text(`${optionIndex + 1}. ${option}`, {
                        size: 40,
                        width: 1300,
                    }),
                    k.pos(baseX + 40, baseY + 120 + optionIndex * 80),
                    k.area(),
                    k.color(0, 0, 0),
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

                        if (result.correct) {
                            //setMessage("Correct! Coins added.");

                            // move to next question
                            state.questionIndex++;

                            // loop back to start
                            if (state.questionIndex >= state.questions.length) {
                                state.questionIndex = 0;
                            }

                            // reload scene to show next question
                            k.go("question");
                        } else {
                            setMessage("Wrong answer.", k.rgb(141, 5, 5));

                            // stay on same question
                        }

                    } catch (err) {
                        setMessage("Could not submit answer");
                        console.error(err);
                    }
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

        // scenes
        k.scene("start", () => {
            addFullBackground("startBg");

            makeButton("startButton", k.width()/2, 580, async () => {
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

            makeButton("creditsButton", k.width()/2, 896, () => {
                k.go("credits");
            }, 8);
        });

        k.scene("credits", () => {
            addFullBackground("questionBg");

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

        });

        k.scene("main", () => {
            addFullBackground("background");
            addHUD();

            addInventoryFishToMainScene();

            makeButton("shopButton", k.width() - 90, 90, () => {
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

            makeButton("nextButton", k.width() - 240, 191, () => {
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

            makeButton("backButton", k.width() - 400, 191, () => {
                k.go("shop");
            });

            makeButton("nextButton", k.width() - 240, 191, () => {
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

            makeButton("backButton", k.width() - 400, 191, () => {
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

            makeButton("sanddollar", k.width() - 200, 191, async () => {
                try {
                    const result = await addCoins(10);
                    state.coins = result.coins;
                    setMessage("+10 coins (cheat button pressed)");
                } catch (err) {
                    setMessage("Could not add coins", k.rgb(255, 0, 0));
                    console.error(err);
                }
            }, 4).use(k.color(255, 0, 0));
        });

        k.go("start");
    });
}