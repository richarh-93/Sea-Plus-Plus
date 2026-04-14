import kaplay from "kaplay";

export default function initKaplay()
{
    return kaplay({
        width: 1920, //video says 1920
        height: 1080, //video says 1080
        letterbox: true,
        global: false, //so that we cant call kaplay globally
        debug: true, //put back to false later
        debugKey: "k",
        canvas: document.getElementById("game"),
        pixelDensity: devicePixelRatio, //makes it sharp on any screen
    });
}