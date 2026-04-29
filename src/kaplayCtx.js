import kaplay from "kaplay";

export default function initKaplay()
{
    return kaplay({
        width: 2048, //video says 1920
        height: 1136, //video says 1080
        letterbox: true,
        global: false, //so that we cant call kaplay globally
        debug: false, //was true for development
        debugKey: "k",
        canvas: document.getElementById("game"),
        pixelDensity: devicePixelRatio, //makes it sharp on any screen
    });
}