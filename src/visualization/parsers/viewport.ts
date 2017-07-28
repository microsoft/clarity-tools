/// <reference path="../../../node_modules/clarity-js/clarity.d.ts" />
import { IParser } from "../components/Snapshot";

export default class Viewport implements IParser {
    private frame: HTMLIFrameElement;
    private state: IViewportState;
    private fullscreen: Boolean;

    setup(frame: HTMLIFrameElement, base: string) {
        this.frame = frame;
        this.fullscreen = frame.parentElement.style.height === "initial";
    }

    shield(width, height, visibility) {
        var px = "px";
        var doc = this.frame.contentDocument;
        var shield = doc.getElementById("clarity-shield");
        if (doc.body) {
            if (shield === null) {
                shield = document.createElement("div");
                shield.id = "clarity-shield";
                shield.style.zIndex = "1001";
                shield.style.position = "absolute";
                doc.body.appendChild(shield);
            }
            shield.style.left = 0 + px;
            shield.style.top = 0 + px;
            shield.style.width = width + px;
            shield.style.height = height + px;
            shield.style.backgroundColor = (visibility === "hidden") ? "rgba(0,0,0,0.4)" : "transparent";
        }
    }

    render(state: IViewportState) {
        this.state = state;
        switch (state.event) {
            case "scroll":
                if (!this.fullscreen) {
                    this.frame.contentWindow.scrollTo(state.viewport.x, state.viewport.y);
                }
                break;
            case "resize":
            case "discover":
                var availableWidth = window.innerWidth;
                var scale = Math.min(availableWidth / state.viewport.width, 1);
                this.frame.style.width = state.viewport.width + "px";
                this.frame.style.height = state.viewport.height + "px";
                this.frame.style.transformOrigin = "0px 0px 0px";
                this.frame.style.transform = "scale(" + scale + ")";
                this.frame.style.border = "1px solid #ccc";
                this.frame.style.overflow = "hidden";
                break;
        }

        this.shield(Math.max(state.document.width, state.viewport.width), Math.max(state.document.height, state.viewport.width), state.visibility);
    }
}
