/// <reference path="../../../node_modules/clarity-js/declarations/clarity.d.ts" />
import { IParser } from "../components/Snapshot";
import { IViewportState } from "clarity-js/clarity";

export default class Viewport implements IParser {
    private document: Document;
    private frame: HTMLIFrameElement;
    private data: IViewportEventData;
    private fullpage: Boolean = false;

    setup(document: Document, frame: HTMLIFrameElement, base: string, thumbnail? : boolean) {
        this.document = document;
        this.frame = frame;
        let oldFullPageValue = this.fullpage;
        this.fullpage = this.frame.hasAttribute("data-fullpage") ? this.frame.getAttribute("data-fullpage") === "true" : false;
        if (oldFullPageValue != this.fullpage) {
            this.resizeFrame();
        }
    }

    shield(width, height, visibility) {
        var px = "px";
        var doc = this.document;
        var shield = doc.getElementById("clarity-shield");
        if (doc.body) {
            if (shield === null) {
                shield = doc.createElement("div");
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

    resizeFrame() {
        let state = this.data;
        if (state) {
            var availableWidth = window.innerWidth;
            var width = this.fullpage ? Math.max(state.viewport.width, state.document.width) : state.viewport.width;
            var height = this.fullpage ? Math.max(state.viewport.height, state.document.height) : state.viewport.height;
            var scale = Math.min(availableWidth / width, 1);
            this.frame.style.width = width + "px";
            this.frame.style.height = height + "px";
            this.frame.style.transformOrigin = "0px 0px 0px";
            this.frame.style.transform = "scale(" + scale + ")";
            this.frame.style.border = "1px solid #ccc";
            this.frame.style.overflow = this.fullpage ? "scroll" : "hidden";
        }
    }

    render(event: IEvent) {
        let data = event.data as IViewportEventData;
        this.data = data;
        switch (data.type) {
            case "scroll":
                if (!this.fullpage) {
                    this.frame.contentWindow.scrollTo(data.viewport.x, data.viewport.y);
                }
                break;
            case "resize":
            case "discover":
            default:
                this.resizeFrame();
                break;
        }

        this.shield(Math.max(data.document.width, data.viewport.width), Math.max(data.document.height, data.viewport.width), data.visibility);
    }
}
