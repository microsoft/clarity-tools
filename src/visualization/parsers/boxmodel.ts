/// <reference path="../../../node_modules/clarity-js/clarity.d.ts" />
import { IParser } from "../components/Snapshot";

export default class BoxModel implements IParser {
    private layouts: { [index: number]: Node } = {};
    private states: { [index: number]: IElementLayoutState } = {};
    private document: Document;
    private base: string;
   
    setup(document: Document, frame: HTMLIFrameElement, base: string, thumbnail? : boolean) {
        this.layouts = {};
        this.document = document;
        this.base = base;
    }

    private domInsert(node: Node, parent: Node, nextSibling?: Node) {
        if (parent) {
            try {
                if (nextSibling && nextSibling.parentNode === parent) {
                    nextSibling.parentNode.insertBefore(node, nextSibling);
                }
                else {
                    parent.appendChild(node);
                }
            }
            catch (ex) {
                console.warn("Error while inserting a node: " + ex);
            }
            return node;
        }
        return null;
    }

    private domRemove(node: Node) {
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
        else {
            console.warn("Remove: Cannot remove: " + node);
        }
        return null;
    }

    private draw(node: HTMLElement, layout: ILayoutRectangle, tag: string, parent: number) : void
    {
        let px = "px";
        let parentX = 0;
        let parentY = 0;

        // Walk up the parent chain to find nearest element with absolute position
        while (parent && parent in this.states) {
            if (this.states[parent] && this.states[parent].layout && 
            (this.states[parent].layout.x || this.states[parent].layout.y)) {
                parentX = this.states[parent].layout.x;
                parentY = this.states[parent].layout.y;
                break;
            }
            parent = this.states[parent].parent;
        }

        node.style.position = "absolute";
        node.style.left = (layout.x - parentX) + px;
        node.style.top = (layout.y - parentY) + px;
        node.style.width = layout.width + px;
        node.style.height = layout.height + px;
        if (tag === "*TXT*") {
            node.style.marginBottom = -1 + px;
            node.style.borderBottom = "1px solid black";
        }
        node.style.backgroundColor = "rgba(0,0,0,0.2)";
    }

    private selector(tag, attributes) {
        if (attributes) {
            return attributes["id"] ? `${tag}#${attributes["id"]}` : (attributes["class"] ? `${tag}.${attributes["class"]}` : tag);
        }
        return tag;
    }

    private insert(state: ILayoutState) {
        var doc = this.document;
        var parent = this.layouts[state.parent];
        var next = state.next in this.layouts ? this.layouts[state.next] : null;
        switch (state.tag) {
            case "*DOC*":
                let docState = state as IDoctypeLayoutState;
                if (typeof XMLSerializer !== "undefined") {
                    this.layouts = {};
                    doc.open();
                    doc.write(new XMLSerializer().serializeToString(
                        this.document.implementation.createDocumentType(
                            docState.attributes["name"],
                            docState.attributes["publicId"],
                            docState.attributes["systemId"]
                        )
                    ));
                    doc.close();
                }
                this.layouts[state.index] = doc;
                break;
            case "HTML":
                this.layouts[state.index] = doc.documentElement;
                break;
            case "HEAD":
                this.layouts[state.index] = doc.head;
                break;
            case "BODY":
                this.layouts[state.index] = doc.body;
                break;
            case "*TXT*":
                let textState = state as ITextLayoutState;
                break;
            default:
                let elementState = state as IElementLayoutState;
                var node = doc.createElement("DIV");
                node.title = this.selector(state.tag, elementState.attributes);
                this.layouts[state.index] = this.domInsert(node, parent, next);
                if (elementState.layout) {
                    this.draw(node, elementState.layout, state.tag, state.parent);
                }
                this.states[state.index] = elementState;
                break;
        }
    }

    private update(state: IElementLayoutState) {
        var node = <HTMLElement>this.layouts[state.index];
        if (node && state.layout) {
            this.draw(node, state.layout, state.tag, state.parent);
            this.layouts[state.index] = node;
        }
        else {
            console.warn(`Move: ${node} doesn't exist`);
        }
    }
    private remove(state: ILayoutState) {
        this.layouts[state.index] = this.domRemove(this.layouts[state.index]);
    }
    private move(state: ILayoutState) {
        var node = this.layouts[state.index];
        var parent = this.layouts[state.parent];
        var next = state.next in this.layouts ? this.layouts[state.next] : null;
        if (node && parent) {
            this.layouts[state.index] = this.domInsert(node, parent, next);
        }
        else {
            console.warn(`Move: ${node} or ${parent} doesn't exist`);
        }
    }

    reset() {

    }

    render(state: IElementLayoutState) {
        switch (state.action) {
            case Action.Insert:
                this.insert(state);
                break;
            case Action.Update:
                this.update(state);
                break;
            case Action.Remove:
                this.remove(state);
                break;
            case Action.Move:
                this.move(state);
                break;
        }
    }
}