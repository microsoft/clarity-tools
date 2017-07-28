/// <reference path="../clarity.d.ts" />
import { IParser } from "../components/Snapshot";

export default class Pointer implements IParser {
    private frame: HTMLIFrameElement;
    private thumbnail: boolean;

    setup(frame: HTMLIFrameElement, base: string) {
        this.frame = frame;
        this.thumbnail = frame.getAttribute("data-clarity") === "thumbnail";
    }

    private colors = {
        "click": "blue",
        "mousedown": "red",
        "mouseup": "green",
        "touchstart": "orange",
        "touchend": "purple",
        "mousemove": "yellow",
        "touchmove": "pink"
    }

    private pointer(x: number, y: number, color: string) {
        var px = "px";
        var doc = this.frame.contentDocument;
        var pointer = doc.getElementById("clarity-pointer");
        if (pointer === null && doc.body) {
            pointer = document.createElement("div");
            if (!this.thumbnail) {
                pointer.id = "clarity-pointer";
            }
            pointer.style.zIndex = "1000";
            pointer.style.position = "absolute";
            pointer.style.opacity = "0.8";
            pointer.style.border = "1px solid #333";
            pointer.style.margin = -1 + px;
            pointer.style.width = 16 + px;
            pointer.style.height = 16 + px;
            pointer.style.borderRadius = 8 + px;
            doc.body.appendChild(pointer);
        }
        pointer.style.background = color;
        pointer.style.left = x + px;
        pointer.style.top = y + px;
    }

    render(state: IPointerState) {
        var color = state.event in this.colors ? this.colors[state.event] : "black";
        this.pointer(state.x, state.y, color);
    }
}
