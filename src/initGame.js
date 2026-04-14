import initKaplay from "./kaplayCtx";

export default function initGame() {
    const k = initKaplay();

    k.loadSprite("background", "/background.png");

    k.loadSprite("testfish", "/testerfish.png", {
        sliceX: 3,
        anims: {
            swim: { from: 0, to: 1, loop: true, speed: 5 }, //i just noticed the third one has its mouth open... no thanks
        },
    });

    k.onLoad(() => {
        // background
        k.add([
            k.sprite("background"),
            k.pos(0, 0),
            k.scale(8),
        ]);

        // fish
        const fish = k.add([
            k.sprite("testfish"),
            k.pos(200, 300),
            k.scale(8),
        ]);

        fish.play("swim");

        let speed = 120;
        let dirX = 1;

        // randomize motion a bit (makes it feel more alive)
        const amplitude = 40 + Math.random() * 30; // up/down size
        const frequency = 1 + Math.random();       // wave speed
        const baseY = fish.pos.y;                  // center line

        // fix initial facing direction
        fish.flipX = dirX === -1;

        fish.onUpdate(() => {
            fish.move(speed * dirX, 0);

            fish.pos.y = baseY + Math.sin(k.time() * frequency) * amplitude;

            if (fish.pos.x > k.width() - fish.width) {
                dirX = -1;
            }

            if (fish.pos.x < 0) {
                dirX = 1;
            }

            // ✅ correct for your sprite
            fish.flipX = dirX === 1;
        });
    });
}