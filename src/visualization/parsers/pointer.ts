/// <reference path="../../../node_modules/clarity-js/clarity.d.ts" />
import { IParser } from "../components/Snapshot";

export default class Pointer implements IParser {
    private document: Document;
    private thumbnail: boolean;
    
    setup(document: Document, frame: HTMLIFrameElement, base: string, thumbnail? : boolean) {
        this.document = document;
        this.thumbnail = !!thumbnail;
    }

    private image = {
        "mousemove": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAYCAYAAAD6S912AAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6AAAdTAAAOpgAAA6lwAAF2+XqZnUAAACaUlEQVR4nGL8f58BHYgAsT8Q2wGxBBAzQcX/AfFrID4CxOuA+BWKLoX/YAoggBjRDHQD4ngglgRiPgyrIOAzEL8E4lVQg1EMBAggFiSFYUAcA8RSOAyCAV4oTgViTiBeiiwJEEAw71gRaRgyEAXiKCB2RBYECCCQgcIMEG+SYhgMiANxEhDzwwQAAghkoAMQK5NhGAwoALE1jAMQQCADQU7mpMBAZqijwAAggEAGqgAxOwUGskHNAAOAAAIZyEtIh4INg3bfHHD6xAUEYAyAAAIZ+IuQgU9fMLCXdzDIzV3JIIhDyQ8YAyCAQAaCUv8/fAZysDP8+/OXgTG7jkFhwRoMQ0F6n8M4AAEEMvAKsg34wM9fDEwgQ1dtRSQTIPgNxFdhHIAAAhm4AYg/EmMgCHz7zsCUVMaguHob3FCQYzbD5AECCGTgJSDeCbWJKPD1GwNzSjmD4tZ9DFxgvQr/b8PkAAIIlvVWA/FuUgz99IWBOTyXQcE+nOEOsjhAACGXNnJAHAnE9kAshqyIV5vB4Ms3cALGBkAlj9////9PgTgAAcSEJPEIiDuBeBYQP2CAhOt3BsLJCpSfNzAyMpqDOAABhF4ewh3FAMmf2kAsyqnBUPDjJ8HcdBvoSjWAAGIEEgTUMTAAbf/AwICSVGCgD4hPgJQA8WegWdsBAogFiyJC4C0QgxI3KLj4gIasRpYECCAGkAsJYSAAuRDEAKUEQwZIzgDxvwCxCrJagAAi1kAQAYpFESh/BlQMhJuR1QIEELEGlgOxHBLflAGSh0Gc60DMBpMDCCCiDMRhyXoGSJUaDgpPmDhAgAEAN5Ugk0bMYNIAAAAASUVORK5CYII=",
        "click": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAYCAYAAAD6S912AAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6AAAdTAAAOpgAAA6lwAAF2+XqZnUAAADvklEQVR4nGL8//8/AzJgZGQQAVL+QGwHxBJAzASV+gfEr4H4CBCvA2p7xYAFAAQQI7KBQMPcgFQ8EEsCMR82DUDwGYhfAvEqoNZ16JIAAQQ3EGhYGJCKAWIpHAahA5BrlwC1L0UWBAggJqhhViQaBgKiQBwF1OuILAgQQExAAWEGiDeRDJsEFOM1AFplzMCgrcnAcIoTh6HiQJwENIMfJgAQQCAXOgCxMkLNaqBkvgIDg8Z3BoaC5wwMz9kYGKIVGRg+MjFgB0C1DNYwDkAAgRSBnIzkgnUCDAyswIBdf4+Bof8ZA0PHYwaGO0D5/Tw4DGSGOgoMAAIIZKAKELMj5D8AFXD+BUbyXwhf9Scw5QAt+MmIw0A2qBlgABBAIAN5cSgkBQjAGAABxALEv1BdiA4YobgFmDZPcjMwZLyB+JILmNAl/0AV/YCpBgggkIGg9MTNgMgRWAAL0MuvWRkYJgNzznRgzP4AqmUHGpj/AhgFnxgYlD4yMKiBVQIEEMiQK8g2YAJQ2JUAY/vFZQaGmfeBvgO6qhUYUU5AQ7qASc1Tg4FB35+RkRGUXRkAAgjkwg0MDMedGBh2AW3m+QtxCQuSgZxAl9h+gbAtvzEwJAN9VAXMxzc+Qlwa+JSBoRQUZL1AvBEggECB4wdMJqsYGH6zQ8IKlBWlgOF6/SowpoGGvQKaDgoqKSDxCWjAA2Cs6gF99AXIfgLEGsuA+kAJuwqYjRkBAgjk5S5gQQL00vHJDAwnLgFz1G9gPCElEbE/EMNAAGSBHjR4eIBiGtuBjKVQV4ABQACBDASG5t/dDAwWPQwMZkDbJlyApMG/UEN38UBc9hvIPwCMPFDy/AmM6UnXgN6eDywcniKHOEAAgQw8BsRBQGezASU7gfm9jYGh8hxQIzD2GIDZ7yYwjXwHuuYPMIHfApr2HxghbxcBY/giA4PmE6TUAgYAAQRilALxASCeBYwpb2A4bGBkTNnLAMmf2sDYBWbN73cZGDiAZeBxYBlp1w00CBg5DBlIXpUH4mcgBkAAMUDLw2So5CQQHxkDQRwQCzFAEn8oAyRVg/J+IVQM5ChgvmfYDFIPEEDIGudCDQ1HM9CFAZI9gckJXC2AggmUfwOh8mpQfZUgPkAAIWsEaToOxF+B2ATdpbgwEKRCDbQB8QECCF1SB4hBkXEeiPmJNBCUbEDZlwfEBwgg5CwBUnAFGDHpQCYw+TBsAbI3MUBqO2xFFyj9CELDdRlQLzg3AQQQLlujoAH9H6oRG/4HlT8ExCowvQABBgBOKHD8+UgEvgAAAABJRU5ErkJggg=="
    }

    private colors = {
        "click": "blue",
        "mousedown": "red",
        "mouseup": "green",
        "touchstart": "orange",
        "touchend": "purple",
        "mousemove": "yellow",
        "touchmove": "pink",
        "mousewheel": "teal",
        "touchcancel": "cyan"
    }

    private pointer(event: string, x: number, y: number) {
        var color = event in this.colors ? this.colors[event] : "black";
        var image = event in this.image ? this.image[event] : null;
        var px = "px";
        var title = `Event: ${event} - (${x}px, ${y}px)`;
        var doc = this.document;
        var pointer = doc.getElementById("clarity-pointer");
        if ((pointer === null) && doc.body) {
            pointer = doc.createElement("div");
            if (!this.thumbnail) {
                pointer.id = "clarity-pointer";
            }
            doc.body.appendChild(pointer);
        }
        pointer.style.zIndex = "1000";
        pointer.style.position = "absolute";
        if (image) {
            pointer.style.background = `url(${image}) no-repeat left center`;
            pointer.style.width = 20 + px;
            pointer.style.height = 24 + px;
            pointer.style.border = "";
        }
        else {
            pointer.style.margin = -1 + px;
            pointer.style.border = "1px solid #333";
            pointer.style.opacity = "0.8";        
            pointer.style.width = 16 + px;
            pointer.style.height = 16 + px;
            pointer.style.borderRadius = 8 + px;
            pointer.style.background = color;
        }
        pointer.setAttribute("title", title);
        // Making sure the pointer and the center of the circle points to where the event happened
        pointer.style.left = (x - (event === "click" ? 5 : 8)) + px;
        pointer.style.top = (y - (event === "click" ? 5 : 8)) + px;
    }

    render(state: IPointerState) {
        this.pointer(state.event, state.x, state.y);
    }
}
