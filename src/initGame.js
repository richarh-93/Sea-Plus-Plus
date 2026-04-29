import initKaplay from "./kaplayCtx";
import { loadFishSprites } from "./loadFishSprites";
import { creditsText } from "./credits";
import {tutorialText } from "./tutorial";
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
        questionIndex: 0,
        altQuestionIndex: 0,
        fishCatalog: [],
        questions: [],
        altQuestions: [],
        inventory: [],
        coinLabel: null,
        messageLabel: null,
    };

    // backgrounds
    k.loadSprite("background", "/background.png");
    k.loadSprite("startBg", "/startmenu/nobuttons.png");
    k.loadSprite("shopBg", "/shopmenu/hybridtanks.png");
    k.loadSprite("eelShopBg", "/shopmenu/eelpage.png");
    k.loadSprite("questionBg", "/questionmenu/questionbackground.png");

    // buttons
    k.loadSprite("new", "/startmenu/new.png");
    k.loadSprite("load", "/startmenu/load.png");
    k.loadSprite("creditsButton", "/startmenu/creditsbutton.png");
    k.loadSprite("shopButton", "/shopbutton.png");
    k.loadSprite("coinButton", "/coinbutton.png");
    k.loadSprite("backButton", "/shopmenu/left.png");
    k.loadSprite("nextButton", "/shopmenu/right.png");
    k.loadSprite("cart", "/shopmenu/cart.png");
    k.loadSprite("sanddollar", "/sanddollar.png");
    k.loadSprite("bal", "balance.png");
    k.loadSprite("changequestiontype", "/questionmenu/changequestiontype.png");

    // fish
    loadFishSprites(k);

    k.onLoad(async () => {
        function getFishSpriteName(fishName) {
            
            if (fishName === "Angelfish") return "angel";
            if (fishName === "Clownfish") return "clown";
            if (fishName === "Pigfish") return "pig";
            if (fishName === "Anglerfish") return "angler";
            if (fishName === "Swordfish") return "sword";
            if (fishName === "Mola Mola") return "mola";
            if (fishName === "Spinner Shark") return "spinner";
            if (fishName === "Boston Lobster") return "lobsterL";
            if (fishName === "Densmoray Eel") return "eel";

            return "angel";
        }

        const fishSpeeds = { //120 if not declared
            "Angelfish": 90,
            "Clownfish": 110,
            "Pigfish": 80,
            "Anglerfish": 70,
            "Swordfish": 170,
            "Mola Mola": 75,
            "Spinner Shark": 190,
            "Boston Lobster": 300,
            "Densmoray Eel": 100,
        };

        const fishY = {
            //1136 total
            // 284, 568, 852 (1/4 2/4 3/4)
            // random if not declared
            "Clownfish": 200,
            "Anglerfish": 950,
            "Swordfish": 500,
            "Mola Mola": 75,
            "Spinner Shark": 350,
            "Boston Lobster": 600,
            "Densmoray Eel": 852,
        };

        const fishSize = {
            //6 on default
            "Clownfish": 5,
            "Pigfish": 7,
            "Swordfish": 7,
            "Mola Mola": 8,
            "Spinner Shark": 8,
            "Densmoray Eel": 7,
        };

        const shopFishSize = { //to change the size of the fish in the shop
            //default 4
            "Mola Mola": 5, 
            "Swordfish": 3.5,
            "Densmoray Eel": 6,
            "Spinner Shark": 4.3,
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
            const uiX = k.width() / 2;
            const uiY = 60;

            k.add([
                k.sprite("bal"),
                k.pos(uiX, uiY),
                k.anchor("center"),
                k.fixed(),
                k.scale(6),
                k.z(99),
            ]);

            k.add([
                k.sprite("sanddollar"),
                k.pos(uiX - 85, uiY),
                k.anchor("center"),
                k.fixed(),
                k.scale(4),
                k.z(100),
            ]);

            state.coinLabel = k.add([
                k.text(`${state.coins}`, { size: 40 }),
                k.pos(uiX - 20, uiY),
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
                k.pos(k.width() / 2, 900),
                k.anchor("center"),
                k.fixed(),
                k.z(100),
                k.color(0, 0, 0),
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
            const isLobster = fishData.name === "Boston Lobster";

            let dirX = Math.random() < 0.5 ? -1 : 1;

            const spriteName = isLobster
                ? dirX === 1
                    ? "lobsterR"
                    : "lobsterL"
                : getFishSpriteName(fishData.name);

            const x = k.rand(120, k.width() - 120);
            const y = fishY[fishData.name] ?? k.rand(220, k.height() - 120);

            const fish = k.add([
                k.sprite(spriteName),
                k.pos(x, y),
                k.scale(fishSize[fishData.name] || 6),
            ]);

            fish.play("swim");

            const baseSpeed = fishSpeeds[fishData.name] || 120;
            let speed = baseSpeed + k.rand(-20, 20);

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

                if (isLobster) {
                    const newSprite = dirX === 1 ? "lobsterR" : "lobsterL";

                    if (fish.sprite !== newSprite) {
                        fish.use(k.sprite(newSprite));
                        fish.play("swim");
                        fish.flipX = dirX === 1;
                    }
                } else {
                    fish.flipX = dirX === 1;
                }
            });
        }

        function addInventoryFishToMainScene() {
            for (let i = 0; i < state.inventory.length; i++) {
                spawnOwnedFish(state.inventory[i], i);
            }
        }

        function addShopItems(items, startX = 550, startY = 560) {
            const spacingX = 408;
            const spacingY = 308;

            items.forEach((fish, i) => {
                const col = i % 4;
                const row = Math.floor(i / 4);

                let x = startX + col * spacingX;
                let y = startY + row * spacingY;

                //center eel
                if (fish.name === "Densmoray Eel") {
                    x = k.width() / 2 + 200;
                    y = k.height() / 2 + 60;
                }

                const isEel = fish.name === "Densmoray Eel";

                const fishCenterX = x - 200;
                const fishCenterY = y - 30;

                const priceX = isEel ? fishCenterX +12 : x+2;
                const priceY = isEel ? fishCenterY + 120 : y - 90;

                const cartX = isEel ? fishCenterX : x;
                const cartY = isEel ? fishCenterY + 200 : y;

                const alreadyOwned = state.inventory.some(f => f.name === fish.name);

                const fishSprite = k.add([
                    k.sprite(getFishSpriteName(fish.name)),
                    k.pos(x - 200, y - 30),
                    k.anchor("center"),
                    k.scale(shopFishSize[fish.name] || 4),
                    k.area(),
                ]);

                fishSprite.frame = 0;

                if (!alreadyOwned) {
                    fishSprite.use(k.color(0, 0, 0));
                }

                fishSprite.onHover(() => {
                    if (alreadyOwned) {
                        fishSprite.play("swim");
                    }
                });

                fishSprite.onHoverEnd(() => {
                    fishSprite.stop();
                    fishSprite.frame = 0;
                });

                if (alreadyOwned) {
                    k.add([
                        k.text(fish.name, { size: 50 }),
                        k.pos(x - 200, y - 180),
                        k.anchor("center"),
                        k.color(0, 0, 0),
                    ]);
                }

                if (!alreadyOwned) {
                    const priceLabel = k.add([
                        k.text(`${fish.price}`, { size: 50 }),
                        k.pos(priceX, priceY),
                        k.anchor("right"),
                        k.color(0, 0, 0),
                    ]);

                    const priceIcon = k.add([
                        k.sprite("sanddollar"),
                        k.pos(priceX + 10, priceY),
                        k.anchor("left"),
                        k.scale(2),
                    ]);

                    const cart = k.add([
                        k.sprite("cart"),
                        k.pos(cartX, cartY),
                        k.anchor("center"),
                        k.area(),
                        k.scale(7),
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

                                cart.destroy();
                                priceLabel.destroy();
                                priceIcon.destroy();

                                if (fish.name === "Densmoray Eel") {
                                    k.go("shop2");
                                } else {
                                    k.go("shop");
                                }
                            } else {
                                priceLabel.color = k.rgb(255, 0, 0);

                                k.wait(1, () => {
                                    priceLabel.color = k.rgb(0, 0, 0);
                                });
                            }
                        }catch (err) {
                            priceLabel.color = k.rgb(255, 0, 0);

                            k.wait(.5, () => {
                                priceLabel.color = k.rgb(0, 0, 0);
                            });

                            console.error(err);
                        }
                    });
                }
            });
        }

        function addQuestionItems() {
            if (state.questions.length === 0) {
                k.add([
                    k.text("No C++ questions loaded", { size: 36 }),
                    k.pos(k.width() / 2, k.height() / 2),
                    k.anchor("center"),
                    k.color(0, 0, 0),
                ]);
                return;
            }

            const q = state.questions[state.questionIndex];

            const baseX = 220;
            const baseY = 300;

            k.add([
                k.text(`${q.question}`, {
                    size: 50,
                    width: 1500,
                }),
                k.pos(baseX, baseY),
                k.color(0, 0, 0),
            ]);

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
                            state.questionIndex++;

                            if (state.questionIndex >= state.questions.length) {
                                state.questionIndex = 0;
                            }

                            k.go("question");
                        } else {
                            setMessage("Wrong answer.", k.rgb(141, 5, 5));
                        }
                    } catch (err) {
                        setMessage("Could not submit answer");
                        console.error(err);
                    }
                });
            });
        }

        function addAltQuestionItems() {
            if (state.altQuestions.length === 0) {
                k.add([
                    k.text("No fish questions loaded", { size: 36 }),
                    k.pos(k.width() / 2, k.height() / 2),
                    k.anchor("center"),
                    k.color(0, 0, 0),
                ]);
                return;
            }

            const q = state.altQuestions[state.altQuestionIndex];

            const baseX = 220;
            const baseY = 300;

            k.add([
                k.text(`${q.question}`, {
                    size: 50,
                    width: 1500,
                }),
                k.pos(baseX, baseY),
                k.color(0, 0, 0),
            ]);

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
                            state.altQuestionIndex++;

                            if (state.altQuestionIndex >= state.altQuestions.length) {
                                state.altQuestionIndex = 0;
                            }

                            k.go("altquestion");
                        } else {
                            setMessage("Wrong answer.", k.rgb(141, 5, 5));
                        }
                    } catch (err) {
                        setMessage("Could not submit answer");
                        console.error(err);
                    }
                });
            });
        }

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
            state.questions = await getQuestions("cpp");
            state.altQuestions = await getQuestions("fish_trivia");
        } catch (err) {
            console.error("Questions failed:", err);
        }

        try {
            const inventoryData = await getInventory();
            state.inventory = inventoryData;
        } catch (err) {
            console.error("Inventory failed:", err);
        }

        k.scene("start", () => {
            addFullBackground("startBg");

            makeButton("new", k.width() / 2, 520, async () => {
                try {
                    await resetGame();

                    state.coins = 0;
                    state.inventory = [];
                    state.questionIndex = 0;

                    state.fishCatalog = await getFishCatalog();
                    state.questions = await getQuestions("cpp");
                    state.altQuestions = await getQuestions("fish_trivia");

                    k.go("tutorial");
                } catch (err) {
                    console.error("New game failed:", err);
                    setMessage("Could not start new game", k.rgb(255, 0, 0));
                }
            },7);

            makeButton("load", k.width() / 2, 740, async () => {
                try {
                    state.coins = (await getCoins()).coins;
                    state.inventory = await getInventory();
                    state.fishCatalog = await getFishCatalog();
                    state.questions = await getQuestions("cpp");
                    state.altQuestions = await getQuestions("fish_trivia");

                    k.go("main");
                } catch (err) {
                    console.error("Load failed:", err);
                    setMessage("Could not load game", k.rgb(255, 0, 0));
                }
            },7);

            makeButton("creditsButton", k.width() / 2, 960, () => {
                k.go("credits");
            },7);
        });

        k.scene("tutorial", () => {
            addFullBackground("questionBg");

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

            k.add([
                k.text("Sea++", { size: 100 }),
                k.pos(k.width() / 2, 190),
                k.anchor("center"),
                k.color(0, 0, 0),
            ]);

            const paragraphY = k.height() / 2 + 20;

            k.add([
                k.text(tutorialText[0].text, {
                    size: 50,
                    width: 1500,
                    lineSpacing: 15,
                    align: "center"
                }),
                k.pos(k.width() / 2, paragraphY),
                k.anchor("center"),
                k.color(0, 0, 0),
            ]);
        });

        k.scene("credits", () => {
            addFullBackground("questionBg");

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

            let startY = 160;

            creditsText.forEach((line, i) => {
                const txt = k.add([
                    k.text(line.text, { size: line.size || 40 }),
                    k.pos(k.width() / 2, startY + i * 80),
                    k.anchor("center"),
                    k.color(0, 0, 0),
                ]);

                //make links clickable
                if (line.link) {
                    txt.use(k.area());

                    txt.onHover(() => {
                        k.setCursor("pointer");
                        txt.color = k.rgb(37, 150, 190);
                    });

                    txt.onHoverEnd(() => {
                        k.setCursor("default");
                        txt.color = k.rgb(0, 0, 0);
                    });

                    txt.onClick(() => {
                        window.open(line.link, "_blank");
                    });
                }
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
            addFullBackground("eelShopBg");
            addHUD();

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

            makeButton("backButton", k.width() - 400, 191, () => {
                k.go("shop");
            });

            // makeButton("nextButton", k.width() - 240, 191, () => {
            //     k.go("shop3");
            // });

            addShopItems(state.fishCatalog.slice(8, 9));
        });

        // k.scene("shop3", () => {
        //     addFullBackground("shopBg");
        //     addHUD();

        //     makeButton("backButton", 200, 191, () => {
        //         k.go("main");
        //     });

        //     makeButton("backButton", k.width() - 400, 191, () => {
        //         k.go("shop2");
        //     });

        //     addShopItems(state.fishCatalog.slice(16, 24));
        // });

        k.scene("question", () => {
            addFullBackground("questionBg");
            addHUD();

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

            addQuestionItems();

            //cheat button:
            // makeButton("sanddollar", k.width() - 200, 191, async () => {
            //     try {
            //         const result = await addCoins(10);
            //         state.coins = result.coins;
            //         setMessage("+10 coins (cheat button pressed)");
            //     } catch (err) {
            //         setMessage("Could not add coins", k.rgb(255, 0, 0));
            //         console.error(err);
            //     }
            // }, 4).use(k.color(255, 0, 0));

            makeButton("changequestiontype", k.width()/2, 191, () => {
                k.go("altquestion"); //go to alternate questions page
            },6);

        });

        k.scene("altquestion", () => {
            addFullBackground("questionBg");
            addHUD();

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });

            addAltQuestionItems();

            //cheat button:
            // makeButton("sanddollar", k.width() - 200, 191, async () => {
            //     try {
            //         const result = await addCoins(10);
            //         state.coins = result.coins;
            //         setMessage("+10 coins (cheat button pressed)");
            //     } catch (err) {
            //         setMessage("Could not add coins", k.rgb(255, 0, 0));
            //         console.error(err);
            //     }
            // }, 4).use(k.color(255, 0, 0));

            makeButton("changequestiontype", k.width()/2, 191, () => {
                k.go("question"); //go to default questions page
            },6);

        });

        k.go("start");
    });
}