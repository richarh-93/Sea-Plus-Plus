import initKaplay from "./kaplayCtx";

export default function initGame() {
    const k = initKaplay();

    // backgrounds
    k.loadSprite("background", "/background.png");
    k.loadSprite("startBg", "/startmenu/startmenu.png");
    k.loadSprite("shopBg", "/shopmenu/fullshop.png");
    k.loadSprite("questionBg", "/questionmenu/questionbackground.png");

    // buttons
    k.loadSprite("startButton", "/startmenu/startbutton.png");
    k.loadSprite("shopButton", "/shopbutton.png");
    k.loadSprite("coinButton", "/coinbutton.png");
    k.loadSprite("backButton", "/shopmenu/left.png");

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

    k.onLoad(() => {
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

        k.scene("start", () => {
            addFullBackground("startBg");

            makeButton("startButton", 1024, 580, () => {
                k.go("main");
            });

            // makeButton("creditButton",1024, 800, () => {
            //     k.go("credits");
            // });
        });

        k.scene("main", () => {
            addFullBackground("background");

            const fish = k.add([
                k.sprite("testfish"),
                k.pos(200, 300),
                k.scale(8),
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

            makeButton("shopButton", k.width()-90, 90, () => {
                k.go("shop");
            }, 4);

            makeButton("coinButton", 90, 90, () => {
                k.go("question");
            }, 4);
        });

        k.scene("shop", () => {
            addFullBackground("shopBg");

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });
        });

        k.scene("question", () => {
            addFullBackground("questionBg");

            makeButton("backButton", 200, 191, () => {
                k.go("main");
            });
        });

        k.go("start");
    });
}