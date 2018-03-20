/// <reference path="../../../node_modules/clarity-js/clarity.d.ts" />
import { IParser } from "../components/Snapshot";
import { IAttributes, ILayoutState, IElementLayoutState, IDoctypeLayoutState, ITextLayoutState, IIgnoreLayoutState, Action } from "clarity-js/clarity";
import { IPerceivedElementLayoutState } from "./IPerceivedElementLayoutState";
import { Layout } from  "../parsers/layout";

export default class PerceivedLoadTimeLayout extends Layout {    
    
    setup(document: Document, frame: HTMLIFrameElement, base: string, thumbnail? : boolean) {
        this.layouts = {};
        this.document = document;
        this.base = base;
    }

    private insertPerceivedLayout (layoutState: ILayoutState) {
        var doc = this.document;
        var state: any = layoutState as IPerceivedElementLayoutState;
        var parent = this.layouts[state.parent];
        var next = state.next in this.layouts ? this.layouts[state.next] : null;
        switch (state.tag) {
            case "*DOC*":
                state = layoutState as IDoctypeLayoutState;
                if (typeof XMLSerializer !== "undefined") {
                    this.layouts = {};
                    doc.open();
                    doc.write(new XMLSerializer().serializeToString(
                        this.document.implementation.createDocumentType(
                            state.attributes["name"],
                            state.attributes["publicId"],
                            state.attributes["systemId"]
                        )
                    ));
                    doc.close();
                }
                this.layouts[state.index] = doc;
                break;
            case "HTML":
                var newDoc = this.document.implementation.createHTMLDocument('');
                var html = newDoc.documentElement;
                this.attributes(html, state.attributes);
                var pointer = doc.importNode(html, true);
                doc.replaceChild(pointer, doc.documentElement);
                if (doc.head) doc.head.parentNode.removeChild(doc.head);
                if (doc.body) doc.body.parentNode.removeChild(doc.body);
                this.layouts[state.index] = doc.documentElement;
                break;
            case "HEAD":
                let headNode = this.document.createElement(state.tag);
                this.attributes(headNode, state.attributes);
                var baseTag = this.document.createElement("base");
                baseTag.href = this.base;
                headNode.appendChild(baseTag);
                parent.appendChild(headNode);
                this.layouts[state.index] = headNode;
                break;
            case "*TXT*":
                state = layoutState as ITextLayoutState;
                var txt = this.document.createTextNode(state.content);
                this.layouts[state.index] = this.domInsert(txt, parent, next);
                break;
            case "OBJECT":
                break;
            case "IFRAME":
                if (!state.layout) break;
            case "IMG":
                var img = <HTMLImageElement>this.createElement(state, parent);
                this.attributes(img, state.attributes);
                if(state.isPerceivedEvent === true ){
                    
                    img.style.color = "red";
                    img.style.opacity = "0.1";
                }
                if (!img.src)
                {
                   
                    img.src = this.placeholderImage;
                    img.style.width = state.layout.width + "px";
                    img.style.height = state.layout.height + "px";
                }
                
                this.layouts[state.index] = this.domInsert(img, parent, next);
                break;
            case "*IGNORE*":
                state = layoutState as IIgnoreLayoutState;
                var ignoredNode = this.document.createElement("div");
                // Ensure that this ignore node doesn't disrupt the layout of other elements
                ignoredNode.style.display = "none";
                ignoredNode.setAttribute("data-index", state.index);
                ignoredNode.setAttribute("data-nodeType", state.nodeType);
                /* nodeType --> 1: ELEMENT_NODE | 3: TEXT_NODE | 8: COMMENT_NODE */
                if (state.nodeType === 1) {
                    ignoredNode.setAttribute("data-tagName", state.elementTag);
                }
                this.domInsert(ignoredNode, parent, next);
                break;
            default:
                let node = this.createElement(state, parent);
                this.attributes(node, state.attributes);
                // Check if this element can be scrolled
                if (state.layout && (state.layout.scrollX || state.layout.scrollY)) {
                    node.scrollLeft = state.layout.scrollX;
                    node.scrollTop = state.layout.scrollY;
                }
                if (node.tagName === "STYLE" && state.cssRules) {
                    for (let i = 0; i < state.cssRules.length; i++) {
                        let textNode = document.createTextNode(state.cssRules[i]);
                        node.appendChild(textNode);
                    }
                }
                this.layouts[state.index] = this.domInsert(node, parent, next);
                break;
        }
    }

    private updatePerceivedLayout(state: IPerceivedElementLayoutState) {
        var node = <HTMLElement>this.layouts[state.index];
        if (node) {
            // First remove all its existing attributes
            if (node.attributes) { 
                var attributes = node.attributes.length;
                while (node.attributes && attributes > 0) {
                    node.removeAttribute(node.attributes[0].name);
                    attributes--;
                } 
            }       
            // Then, update attributes from the new received event state
            this.attributes(node, state.attributes);
            // Special handling for image nodes
            if (node.tagName === "IMG") {
                
                let img = <HTMLImageElement> node;
                if (!img.src)
                {
                    img.src = this.placeholderImage;
                    img.style.width = state.layout.width + "px";
                    img.style.height = state.layout.height + "px";
                }
                
                if(state.isPerceivedEvent === true ){
                    
                    img.style.color = "red";
                    img.style.opacity = "0.1";

                }else{
                    
                    img.style.color = "red";
                    img.style.opacity = "1";
                }
                
            }
            // If we have content for this node
            if (state.tag === "*TXT*" && (<ITextLayoutState>(state as ILayoutState)).content) {
                node.nodeValue = (<ITextLayoutState>(state as ILayoutState)).content;
            }
            // Check if this element can be scrolled
            if (state.layout && (state.layout.scrollX || state.layout.scrollY)) {
                node.scrollLeft = state.layout.scrollX;
                node.scrollTop = state.layout.scrollY;
            }
            this.layouts[state.index] = node;
        }
        else {
            console.warn(`Move: ${node} doesn't exist`);
        }
    }

    

    render(state: IPerceivedElementLayoutState) {
        switch (state.action) {
            case Action.Insert:
                this.insertPerceivedLayout(state);
                break;
            case Action.Update:
                this.updatePerceivedLayout(state);
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