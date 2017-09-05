/// <reference path="../../../node_modules/clarity-js/clarity.d.ts" />
import { IParser } from "../components/Snapshot";

export default class Pointer implements IParser {
    private document: Document;
    private thumbnail: boolean;

    setup(document: Document, frame: HTMLIFrameElement, base: string, thumbnail? : boolean) {
        this.document = document;
        this.thumbnail = !!thumbnail;
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
        var doc = this.document;
        var pointer = doc.getElementById("clarity-pointer");
        if (pointer === null && doc.body) {
            pointer = doc.createElement("div");
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
