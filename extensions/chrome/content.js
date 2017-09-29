(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clarity = require("clarity-js");
var payloads = [];
chrome.runtime.sendMessage({ status: true }, function (response) {
    if (response.active) {
        payloads = [];
        chrome.storage.sync.get({
            clarity: { showText: false, showImages: true, showLines: true, enabled: true }
        }, function (items) {
            if (items.clarity.enabled) {
                clarity.start({
                    showText: items.clarity.showText,
                    showImages: items.clarity.showImages,
                    showLines: items.clarity.showLines,
                    uploadHandler: upload,
                    fetchColor: true,
                    instrument: true
                });
            }
        });
    }
});
function upload(payload) {
    chrome.runtime.sendMessage({ payload: payload }, function (response) {
        if (!response.success) {
            console.warn("Clarity failed to receive the payload.");
        }
    });
}

},{"clarity-js":2}],2:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.clarity = global.clarity || {})));
}(this, (function (exports) { 'use strict';

var config = {
    plugins: ["viewport", "layout", "pointer", "performance", "errors"],
    uploadUrl: "",
    delay: 500,
    batchLimit: 100 * 1024,
    totalLimit: 20 * 1024 * 1024,
    showText: false,
    showImages: false,
    timeToYield: 50,
    instrument: false,
    uploadHandler: null,
    debug: false,
    validateConsistency: false,
    waitForTrigger: false
};

var compress = function (uncompressed) {
    var bitsPerChar = 6;
    var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var getCharFromInt = function (a) { return keyStrBase64.charAt(a); };
    if (uncompressed == null)
        return "";
    var i, value, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = "", context_wc = "", context_w = "", context_enlargeIn = 2, context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0, ii;
    for (ii = 0; ii < uncompressed.length; ii += 1) {
        context_c = uncompressed.charAt(ii);
        if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
            context_dictionary[context_c] = context_dictSize++;
            context_dictionaryToCreate[context_c] = true;
        }
        context_wc = context_w + context_c;
        if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
            context_w = context_wc;
        }
        else {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 8; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                else {
                    value = 1;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | value;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = 0;
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 16; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            }
            else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    }
                    else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
            }
            context_dictionary[context_wc] = context_dictSize++;
            context_w = String(context_c);
        }
    }
    if (context_w !== "") {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
            if (context_w.charCodeAt(0) < 256) {
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    }
                    else {
                        context_data_position++;
                    }
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 8; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    }
                    else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            else {
                value = 1;
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | value;
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    }
                    else {
                        context_data_position++;
                    }
                    value = 0;
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 16; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    }
                    else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
            }
            delete context_dictionaryToCreate[context_w];
        }
        else {
            value = context_dictionary[context_w];
            for (i = 0; i < context_numBits; i++) {
                context_data_val = (context_data_val << 1) | (value & 1);
                if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                }
                else {
                    context_data_position++;
                }
                value = value >> 1;
            }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
        }
    }
    value = 2;
    for (i = 0; i < context_numBits; i++) {
        context_data_val = (context_data_val << 1) | (value & 1);
        if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
        }
        else {
            context_data_position++;
        }
        value = value >> 1;
    }
    while (true) {
        context_data_val = (context_data_val << 1);
        if (context_data_position == bitsPerChar - 1) {
            context_data.push(getCharFromInt(context_data_val));
            break;
        }
        else
            context_data_position++;
    }
    var res = context_data.join('');
    switch (res.length % 4) {
        default:
        case 0: return res;
        case 1: return res + "===";
        case 2: return res + "==";
        case 3: return res + "=";
    }
};

function createCompressionWorker(envelope, onMessage, onError) {
    var worker = null;
    if (Worker) {
        var workerUrl = createWorkerUrl(envelope);
        worker = new Worker(workerUrl);
        worker.onmessage = onMessage || null;
        worker.onerror = onError || null;
    }
    return worker;
}
function workerContext() {
    var workerGlobalScope = self;
    var compress$$1 = workerGlobalScope.compress;
    var config$$1 = workerGlobalScope.config;
    var envelope = workerGlobalScope.envelope;
    var nextBatchEvents = [];
    var nextBatchBytes = 0;
    var sequence = 0;
    var nextBatchIsSingleXhrErrorEvent = false;
    self.onmessage = function (evt) {
        var message = evt.data;
        switch (message.type) {
            case 0:
                var addEventMsg = message;
                addEvent(addEventMsg.event, addEventMsg.time);
                break;
            case 1:
                var forceCompressionMsg = message;
                postNextBatchToCore(forceCompressionMsg.time);
                break;
            default:
                break;
        }
    };
    function addEvent(event, time) {
        var eventStr = JSON.stringify(event);
        if (nextBatchBytes > 0 && nextBatchBytes + eventStr.length > config$$1.batchLimit) {
            postNextBatchToCore(time);
        }
        nextBatchEvents.push(event);
        nextBatchBytes += eventStr.length;
        nextBatchIsSingleXhrErrorEvent = (nextBatchEvents.length === 1 && event.state && event.state.type === 2);
        if (nextBatchBytes >= config$$1.batchLimit) {
            postNextBatchToCore(time);
        }
    }
    function postNextBatchToCore(time) {
        if (nextBatchBytes > 0 && !nextBatchIsSingleXhrErrorEvent) {
            envelope.sequenceNumber = sequence++;
            envelope.time = time;
            var raw = JSON.stringify({ envelope: envelope, events: nextBatchEvents });
            var compressed = compress$$1(raw);
            var eventCount = nextBatchEvents.length;
            nextBatchEvents = [];
            nextBatchBytes = 0;
            postToCore(compressed, raw, eventCount);
        }
    }
    function postToCore(compressed, uncompressed, eventCount) {
        var message = {
            type: 2,
            compressedData: compressed,
            rawData: uncompressed,
            eventCount: eventCount
        };
        workerGlobalScope.postMessage(message);
    }
}
function createWorkerUrl(envelope) {
    var workerContextStr = workerContext.toString();
    var workerStr = workerContextStr.substring(workerContextStr.indexOf("{") + 1, workerContextStr.lastIndexOf("}"));
    var code = "self.compress=" + compress.toString() + ";"
        + ("self.config=" + JSON.stringify(config) + ";")
        + ("self.envelope=" + JSON.stringify(envelope) + ";")
        + workerStr;
    var blob = new Blob([code], { type: "application/javascript" });
    return URL.createObjectURL(blob);
}

var ErrorMonitor = (function () {
    function ErrorMonitor() {
    }
    ErrorMonitor.prototype.activate = function () {
        bind(window, "error", logError);
    };
    ErrorMonitor.prototype.reset = function () {
        return;
    };
    ErrorMonitor.prototype.teardown = function () {
        return;
    };
    return ErrorMonitor;
}());
function logError(errorToLog) {
    var error = errorToLog["error"] || errorToLog;
    var source = errorToLog["filename"];
    var lineno = errorToLog["lineno"];
    var colno = errorToLog["colno"];
    var message = error.message;
    var stack = error.stack;
    var jsErrorEventState = {
        type: 0,
        message: message,
        stack: stack,
        lineno: lineno,
        colno: colno,
        source: source
    };
    instrument(jsErrorEventState);
}

function guid() {
    var d = new Date().getTime();
    if (window.performance && performance.now) {
        d += performance.now();
    }
    var uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
function setCookie(cookieName, value, expDays) {
    var expDate = null;
    if (expDays) {
        expDate = new Date();
        expDate.setDate(expDate.getDate() + expDays);
    }
    var expires = expDate ? "expires=" + expDate.toUTCString() : "";
    var cookieValue = value + ";" + expires + ";path=/";
    document.cookie = cookieName + "=" + cookieValue;
}
function getCookie(cookieName) {
    var arrayOfCookies = document.cookie.split(";");
    if (arrayOfCookies) {
        for (var i = 0; i < arrayOfCookies.length; i++) {
            var cookiePair = arrayOfCookies[i].split("=");
            if (cookiePair && cookiePair.length > 1 && cookiePair[0].indexOf(cookieName) >= 0) {
                return cookiePair[1];
            }
        }
    }
    return null;
}
function mapProperties(sourceObj, mapFunction, ownPropertiesOnly, outObj) {
    outObj = outObj || {};
    for (var property in sourceObj) {
        if (!ownPropertiesOnly || sourceObj.hasOwnProperty(property)) {
            var sourceValue = sourceObj[property];
            var outValue = mapFunction ? mapFunction(property, sourceValue) : sourceValue;
            if (typeof outValue !== "undefined") {
                outObj[property] = outValue;
            }
        }
    }
    return outObj;
}
function traverseNodeTree(node, processingFunc) {
    var queue = [node];
    while (queue.length > 0) {
        var next = queue.shift();
        processingFunc(next);
        var nextChild = next.firstChild;
        while (nextChild) {
            queue.push(nextChild);
            nextChild = nextChild.nextSibling;
        }
    }
}

function isNumber(value) {
    return (typeof value === "number" && !isNaN(value));
}
function assert(condition, source, comment) {
    if (condition === false) {
        debug(">>> Clarity Assert failed\nSource: " + source + "\nComment: " + comment);
        var eventState = {
            type: 5,
            source: source,
            comment: comment
        };
        instrument(eventState);
    }
}
function debug(text) {
    if (config.debug && console.log) {
        console.log(text);
    }
}

var NodeIndex = "clarity-index";
var DoctypeTag = "*DOC*";
var TextTag = "*TXT*";
var IgnoreTag = "*IGNORE*";
var MetaTag = "META";
var ScriptTag = "SCRIPT";
var attributeMaskList = ["value", "placeholder", "alt", "title"];
function getNodeIndex(node) {
    return (node && NodeIndex in node) ? node[NodeIndex] : null;
}
function createLayoutState(node, shadowDom) {
    if (shouldIgnoreNode(node, shadowDom)) {
        return createIgnoreLayoutState(node);
    }
    var layoutState = null;
    switch (node.nodeType) {
        case Node.DOCUMENT_TYPE_NODE:
            layoutState = createDoctypeLayoutState(node);
            break;
        case Node.TEXT_NODE:
            layoutState = createTextLayoutState(node);
            break;
        case Node.ELEMENT_NODE:
            layoutState = createElementLayoutState(node);
            break;
        default:
            layoutState = createIgnoreLayoutState(node);
            break;
    }
    return layoutState;
}
function createDoctypeLayoutState(doctypeNode) {
    var doctypeState = createGenericLayoutState(doctypeNode, DoctypeTag);
    doctypeState.attributes = {
        name: doctypeNode.name,
        publicId: doctypeNode.publicId,
        systemId: doctypeNode.systemId
    };
    return doctypeState;
}
function createElementLayoutState(element) {
    var tagName = element.tagName;
    var elementState = createGenericLayoutState(element, tagName);
    if (tagName === ScriptTag || tagName === MetaTag) {
        elementState.tag = IgnoreTag;
        return elementState;
    }
    var elementAttributes = element.attributes;
    var stateAttributes = {};
    for (var i = 0; i < elementAttributes.length; i++) {
        var attr = elementAttributes[i];
        var attrName = attr.name.toLowerCase();
        if (tagName === "IMG" && !config.showImages && attrName === "src") {
            continue;
        }
        if (!config.showText && attributeMaskList.indexOf(attrName) >= 0) {
            stateAttributes[attr.name] = attr.value.replace(/\S/gi, "*");
        }
        else {
            stateAttributes[attr.name] = attr.value;
        }
    }
    elementState.attributes = stateAttributes;
    var rect = null;
    try {
        rect = element.getBoundingClientRect();
    }
    catch (e) {
    }
    elementState.layout = null;
    if (rect) {
        var styles = window.getComputedStyle(element);
        elementState.layout = {
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        };
        if (styles["overflow-x"] === "auto"
            || styles["overflow-x"] === "scroll"
            || styles["overflow-x"] === "hidden"
            || styles["overflow-y"] === "auto"
            || styles["overflow-y"] === "scroll"
            || styles["overflow-y"] === "hidden") {
            elementState.layout.scrollX = Math.round(element.scrollLeft);
            elementState.layout.scrollY = Math.round(element.scrollTop);
        }
    }
    return elementState;
}
function createTextLayoutState(textNode) {
    var showText = (textNode.parentNode && textNode.parentNode.tagName === "STYLE") ? true : config.showText;
    var textState = createGenericLayoutState(textNode, TextTag);
    textState.content = showText ? textNode.textContent : textNode.textContent.replace(/\S/gi, "*");
    return textState;
}
function createIgnoreLayoutState(node) {
    var layoutState = createGenericLayoutState(node, IgnoreTag);
    layoutState.nodeType = node.nodeType;
    if (node.nodeType === Node.ELEMENT_NODE) {
        layoutState.elementTag = node.tagName;
    }
    return layoutState;
}
function createGenericLayoutState(node, tag) {
    var layoutState = {
        index: getNodeIndex(node),
        parent: getNodeIndex(node.parentNode),
        previous: getNodeIndex(node.previousSibling),
        next: getNodeIndex(node.nextSibling),
        source: null,
        action: null,
        tag: tag
    };
    return layoutState;
}
function shouldIgnoreNode(node, shadowDom) {
    var shadowNode = shadowDom.getShadowNode(getNodeIndex(node));
    var ignore = false;
    switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            var tagName = node.tagName;
            if (tagName === ScriptTag || tagName === MetaTag) {
                ignore = true;
            }
            break;
        case Node.COMMENT_NODE:
            ignore = true;
            break;
        default:
            break;
    }
    if (!ignore) {
        var parentIndex = getNodeIndex(node.parentNode);
        if (parentIndex !== null) {
            var parentShadowNode = shadowDom.getShadowNode(parentIndex);
            assert(!!parentShadowNode, "shouldIgnoreNode", "parentShadowNode is missing");
            if (parentShadowNode && parentShadowNode.ignore && parentShadowNode.node !== document) {
                ignore = true;
            }
        }
    }
    return ignore;
}

var FinalClassName = "cl-final";
var NewNodeClassName = "cl-new";
var MovedNodeClassName = "cl-moved";
var UpdatedNodeClassName = "cl-updated";
var ShadowDom = (function () {
    function ShadowDom() {
        this.doc = document.implementation.createHTMLDocument("ShadowDom");
        this.nextIndex = 0;
        this.removedNodes = this.doc.createElement("div");
        this.shadowDomRoot = this.doc.createElement("div");
        this.classifyNodes = false;
        this.nodeMap = [];
        this.doc.documentElement.appendChild(this.shadowDomRoot);
        this.shadowDocument = document.createElement("div");
    }
    ShadowDom.prototype.getShadowNode = function (index) {
        var node = isNumber(index) ? this.nodeMap[index] : null;
        return node;
    };
    ShadowDom.prototype.insertShadowNode = function (node, parentIndex, nextSiblingIndex) {
        var isDocument = (node === document);
        var index = this.setNodeIndex(node);
        var parent = (isDocument ? this.shadowDomRoot : this.getShadowNode(parentIndex));
        var nextSibling = this.getShadowNode(nextSiblingIndex);
        var shadowNode = this.doc.createElement("div");
        shadowNode.id = "" + index;
        shadowNode.node = node;
        shadowNode.ignore = shouldIgnoreNode(node, this);
        this.nodeMap[index] = shadowNode;
        if (isDocument) {
            this.shadowDocument = shadowNode;
        }
        if (this.classifyNodes) {
            this.setClass(shadowNode, NewNodeClassName);
        }
        assert(!!parent, "insertShadowNode", "parent is missing");
        if (parent) {
            if (nextSibling) {
                parent.insertBefore(shadowNode, nextSibling);
            }
            else {
                parent.appendChild(shadowNode);
            }
        }
        return shadowNode;
    };
    ShadowDom.prototype.moveShadowNode = function (index, newParentIndex, newNextSiblingIndex) {
        var shadowNode = this.getShadowNode(index);
        var parent = this.getShadowNode(newParentIndex);
        var nextSibling = this.getShadowNode(newNextSiblingIndex);
        assert(!!parent, "moveShadowNode", "parent is missing");
        assert(!!shadowNode, "moveShadowNode", "shadowNode is missing");
        if (parent && shadowNode) {
            if (this.classifyNodes) {
                if (!this.hasClass(shadowNode, NewNodeClassName)) {
                    this.setClass(shadowNode, MovedNodeClassName);
                }
            }
            if (nextSibling) {
                parent.insertBefore(shadowNode, nextSibling);
            }
            else {
                parent.appendChild(shadowNode);
            }
        }
        return shadowNode;
    };
    ShadowDom.prototype.updateShadowNode = function (index) {
        var shadowNode = this.getShadowNode(index);
        if (shadowNode && this.classifyNodes) {
            this.setClass(shadowNode, UpdatedNodeClassName);
        }
    };
    ShadowDom.prototype.removeShadowNode = function (index) {
        var shadowNode = this.getShadowNode(index);
        if (shadowNode) {
            this.setClass(shadowNode, MovedNodeClassName);
            this.removedNodes.appendChild(shadowNode);
        }
    };
    ShadowDom.prototype.applyMutationBatch = function (mutations) {
        var nextIndexBeforeProcessing = this.nextIndex;
        this.doc.documentElement.appendChild(this.removedNodes);
        this.classifyNodes = true;
        var length = mutations.length;
        for (var i = 0; i < length; i++) {
            var mutation = mutations[i];
            var target = mutation.target;
            switch (mutation.type) {
                case "attributes":
                case "characterData":
                    this.applyUpdate(target, mutation.attributeName, mutation.oldValue);
                    break;
                case "childList":
                    var addedLength = mutation.addedNodes.length;
                    for (var j = addedLength - 1; j >= 0; j--) {
                        var previous = mutation.previousSibling;
                        var next = mutation.nextSibling;
                        if (j > 0) {
                            previous = mutation.addedNodes[j - 1];
                        }
                        if (j < addedLength - 1) {
                            next = mutation.addedNodes[j + 1];
                        }
                        this.applyInsert(mutation.addedNodes[j], target, previous, next, false);
                    }
                    var removedLength = mutation.removedNodes.length;
                    for (var j = 0; j < removedLength; j++) {
                        this.applyRemove(mutation.removedNodes[j], target);
                    }
                    break;
                default:
                    break;
            }
        }
        this.removedNodes.parentElement.removeChild(this.removedNodes);
        this.reIndexNewNodes(nextIndexBeforeProcessing);
        var summary = this.getMutationSummary();
        var finalNodes = Array.prototype.slice.call(this.doc.getElementsByClassName(FinalClassName));
        for (var i = 0; i < finalNodes.length; i++) {
            this.removeAllClasses(finalNodes[i]);
        }
        this.removedNodes.innerHTML = "";
        this.classifyNodes = false;
        return summary;
    };
    ShadowDom.prototype.hasClass = function (shadowNode, className) {
        return shadowNode ? shadowNode.classList.contains(className) : false;
    };
    ShadowDom.prototype.setClass = function (shadowNode, className) {
        if (shadowNode) {
            shadowNode.classList.add(className);
        }
    };
    ShadowDom.prototype.removeClass = function (shadowNode, className) {
        if (shadowNode) {
            shadowNode.classList.remove(className);
        }
    };
    ShadowDom.prototype.removeAllClasses = function (shadowNode) {
        if (shadowNode) {
            shadowNode.removeAttribute("class");
        }
    };
    ShadowDom.prototype.getMutationSummary = function () {
        var _this = this;
        var summary = {
            newNodes: [],
            movedNodes: [],
            updatedNodes: [],
            removedNodes: []
        };
        var newNodes = Array.prototype.slice.call(this.doc.getElementsByClassName(NewNodeClassName));
        for (var i = 0; i < newNodes.length; i++) {
            var newNode = newNodes[i];
            summary.newNodes.push(newNode);
            this.removeAllClasses(newNode);
        }
        var moved = Array.prototype.slice.call(this.doc.getElementsByClassName(MovedNodeClassName));
        for (var i = 0; i < moved.length; i++) {
            var next = moved[i];
            summary.movedNodes.push(next);
            this.removeClass(next, MovedNodeClassName);
        }
        var updated = Array.prototype.slice.call(this.doc.getElementsByClassName(UpdatedNodeClassName));
        for (var i = 0; i < updated.length; i++) {
            var next = updated[i];
            summary.updatedNodes.push(next);
            this.removeAllClasses(next);
        }
        var removedNodes = this.removedNodes.childNodes;
        for (var i = 0; i < removedNodes.length; i++) {
            traverseNodeTree(removedNodes[i], function (shadowNode) {
                if (_this.hasClass(shadowNode, NewNodeClassName)) {
                    delete shadowNode.node[NodeIndex];
                }
                else if (_this.hasClass(shadowNode, MovedNodeClassName)) {
                    summary.removedNodes.push(shadowNode);
                }
            });
        }
        return summary;
    };
    ShadowDom.prototype.createIndexJson = function (rootNode, getIndexFromNode) {
        var indexJson = {};
        this.writeIndexToJson(rootNode, indexJson, getIndexFromNode);
        return indexJson;
    };
    ShadowDom.prototype.isConsistent = function () {
        return this.isConstentSubtree(document, this.shadowDocument);
    };
    ShadowDom.prototype.writeIndexToJson = function (node, json, getIndexFromNode) {
        var index = getIndexFromNode(node);
        var childJson = {};
        var nextChild = node.firstChild;
        json[index] = nextChild ? childJson : null;
        while (nextChild) {
            this.writeIndexToJson(nextChild, childJson, getIndexFromNode);
            nextChild = nextChild.nextSibling;
        }
    };
    ShadowDom.prototype.isConsistentNode = function (node, shadowNode) {
        var index = getNodeIndex(node);
        return (isNumber(index) && shadowNode.id === (index).toString() && shadowNode.node === node);
    };
    ShadowDom.prototype.isConstentSubtree = function (node, shadowNode) {
        var isConsistent = this.isConsistentNode(node, shadowNode);
        var nextChild = node.firstChild;
        var nextShadowChild = shadowNode.firstChild;
        while (isConsistent) {
            if (nextChild && nextShadowChild) {
                isConsistent = this.isConstentSubtree(nextChild, nextShadowChild);
                nextChild = nextChild.nextSibling;
                nextShadowChild = nextShadowChild.nextSibling;
            }
            else if (nextChild || nextShadowChild) {
                isConsistent = false;
            }
            else {
                break;
            }
        }
        return isConsistent;
    };
    ShadowDom.prototype.applyInsert = function (addedNode, parent, previousSibling, nextSibling, force) {
        var addedNodeIndex = getNodeIndex(addedNode);
        var parentIndex = getNodeIndex(parent);
        var nextSiblingIndex = getNodeIndex(nextSibling);
        var validMutation = this.shouldProcessChildListMutation(addedNode, parent) || force;
        if (validMutation) {
            if (addedNodeIndex === null) {
                var shadowNode = this.insertShadowNode(addedNode, parentIndex, nextSiblingIndex);
                this.setClass(shadowNode, FinalClassName);
                var nextChild = addedNode.lastChild;
                while (nextChild) {
                    this.applyInsert(nextChild, addedNode, nextChild.previousSibling, nextChild.nextSibling, true);
                    nextChild = nextChild.previousSibling;
                }
            }
            else {
                this.moveShadowNode(addedNodeIndex, parentIndex, getNodeIndex(nextSibling));
            }
        }
    };
    ShadowDom.prototype.applyRemove = function (removedNode, parent) {
        var removedNodeIndex = getNodeIndex(removedNode);
        if (removedNodeIndex !== null) {
            var validMutation = this.shouldProcessChildListMutation(removedNode, parent);
            if (validMutation) {
                this.removeShadowNode(removedNodeIndex);
            }
        }
    };
    ShadowDom.prototype.applyUpdate = function (updatedNode, attrName, oldValue) {
        var updatedNodeIndex = getNodeIndex(updatedNode);
        if (updatedNodeIndex != null) {
            this.updateShadowNode(updatedNodeIndex);
        }
    };
    ShadowDom.prototype.shouldProcessChildListMutation = function (child, parent) {
        var childNodeIndex = getNodeIndex(child);
        var parentIndex = getNodeIndex(parent);
        var parentShadowNode = null;
        if (childNodeIndex === null) {
            parentShadowNode = this.getShadowNode(parentIndex);
        }
        else {
            var childShadowNode = this.getShadowNode(childNodeIndex);
            parentShadowNode = childShadowNode && childShadowNode.parentNode;
        }
        return parentShadowNode && !this.hasClass(parentShadowNode, FinalClassName);
    };
    ShadowDom.prototype.reIndexNewNodes = function (nextIndex) {
        var newNodes = this.doc.getElementsByClassName(NewNodeClassName);
        for (var i = 0; i < newNodes.length; i++) {
            var shadowNode = newNodes[i];
            var currentIndex = getNodeIndex(shadowNode);
            shadowNode.id = "" + nextIndex;
            shadowNode.node[NodeIndex] = nextIndex;
            this.nodeMap[currentIndex] = undefined;
            this.nodeMap[nextIndex] = shadowNode;
            nextIndex++;
        }
        this.nextIndex = nextIndex;
    };
    ShadowDom.prototype.setNodeIndex = function (node) {
        var index = getNodeIndex(node);
        if (index === null) {
            index = this.nextIndex;
            this.nextIndex++;
        }
        node[NodeIndex] = index;
        return index;
    };
    return ShadowDom;
}());

var Layout = (function () {
    function Layout() {
        this.eventName = "Layout";
        this.distanceThreshold = 5;
    }
    Layout.prototype.reset = function () {
        this.shadowDom = new ShadowDom();
        this.inconsistentShadowDomCount = 0;
        this.watchList = [];
        this.observer = window["MutationObserver"] ? new MutationObserver(this.mutation.bind(this)) : null;
        this.mutationSequence = 0;
        this.domDiscoverComplete = false;
        this.domPreDiscoverMutations = [];
        this.lastConsistentDomJson = null;
        this.firstShadowDomInconsistentEvent = null;
        this.layoutStates = [];
        this.originalLayouts = [];
    };
    Layout.prototype.activate = function () {
        this.discoverDom();
        if (this.observer) {
            this.observer.observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    };
    Layout.prototype.teardown = function () {
        if (this.observer) {
            this.observer.disconnect();
        }
        var documentShadowNode = this.shadowDom.shadowDocument;
        if (documentShadowNode.node) {
            delete documentShadowNode.node[NodeIndex];
        }
        var otherNodes = this.shadowDom.shadowDocument.querySelectorAll("*");
        for (var i = 0; i < otherNodes.length; i++) {
            var node = otherNodes[i].node;
            if (node) {
                delete node[NodeIndex];
            }
        }
    };
    Layout.prototype.discoverDom = function () {
        var _this = this;
        var discoverTime = getTimestamp();
        traverseNodeTree(document, this.discoverNode.bind(this));
        this.checkConsistency({
            action: 0
        });
        setTimeout(function () {
            _this.backfillLayoutsAsync(discoverTime, _this.onDomDiscoverComplete.bind(_this));
        }, 0);
    };
    Layout.prototype.discoverNode = function (node) {
        this.shadowDom.insertShadowNode(node, getNodeIndex(node.parentNode), getNodeIndex(node.nextSibling));
        var index = getNodeIndex(node);
        var layout = createGenericLayoutState(node, null);
        this.layoutStates[index] = layout;
        this.originalLayouts.push({
            node: node,
            layout: layout
        });
    };
    Layout.prototype.backfillLayoutsAsync = function (time, onDomDiscoverComplete) {
        var _this = this;
        var yieldTime = getTimestamp(true) + config.timeToYield;
        var events = [];
        while (this.originalLayouts.length > 0 && getTimestamp(true) < yieldTime) {
            var originalLayout = this.originalLayouts.shift();
            var originalLayoutState = originalLayout.layout;
            var currentLayoutState = createLayoutState(originalLayout.node, this.shadowDom);
            currentLayoutState.index = originalLayout.layout.index;
            currentLayoutState.parent = originalLayoutState.parent;
            currentLayoutState.previous = originalLayoutState.previous;
            currentLayoutState.next = originalLayoutState.next;
            currentLayoutState.source = 0;
            currentLayoutState.action = 0;
            events.push({
                type: this.eventName,
                state: currentLayoutState,
                time: time
            });
            this.layoutStates[originalLayout.layout.index] = currentLayoutState;
        }
        addMultipleEvents(events);
        if (this.originalLayouts.length > 0) {
            setTimeout(function () {
                _this.backfillLayoutsAsync(time, onDomDiscoverComplete);
            }, 0);
        }
        else {
            onDomDiscoverComplete();
        }
    };
    Layout.prototype.onDomDiscoverComplete = function () {
        this.domDiscoverComplete = true;
        for (var i = 0; i < this.domPreDiscoverMutations.length; i++) {
            this.processMultipleNodeEvents(this.domPreDiscoverMutations[i]);
        }
    };
    Layout.prototype.processMultipleNodeEvents = function (eventInfos) {
        var eventsData = [];
        for (var i = 0; i < eventInfos.length; i++) {
            var eventState = this.createEventState(eventInfos[i]);
            eventsData.push({
                type: this.eventName,
                state: eventState
            });
            this.layoutStates[eventState.index] = eventState;
        }
        addMultipleEvents(eventsData);
    };
    Layout.prototype.createEventState = function (eventInfo) {
        var node = eventInfo.node;
        var layoutState = createLayoutState(node, this.shadowDom);
        switch (eventInfo.action) {
            case 0:
                if (node.nodeType === Node.ELEMENT_NODE) {
                    this.watch(node, layoutState);
                }
                layoutState.action = 0;
                break;
            case 1:
                layoutState.action = 1;
                break;
            case 2:
                layoutState.index = eventInfo.index;
                layoutState.action = 2;
                break;
            case 3:
                layoutState.action = 3;
                break;
            default:
                break;
        }
        if (eventInfo.source === 1) {
            layoutState.mutationSequence = this.mutationSequence;
        }
        layoutState.source = eventInfo.source;
        return layoutState;
    };
    Layout.prototype.watch = function (element, layoutState) {
        if (this.watchList[layoutState.index]) {
            return;
        }
        var scrollPossible = (layoutState.layout
            && ("scrollX" in layoutState.layout
                || "scrollY" in layoutState.layout));
        if (scrollPossible) {
            bind(element, "scroll", this.layoutHandler.bind(this, element, 2));
            this.watchList[layoutState.index] = true;
        }
        if (element.tagName === "INPUT") {
            bind(element, "change", this.layoutHandler.bind(this, element, 3));
            this.watchList[layoutState.index] = true;
        }
    };
    Layout.prototype.layoutHandler = function (element, source) {
        var index = getNodeIndex(element);
        var recordEvent = true;
        if (index !== null) {
            var time = getTimestamp();
            var lastLayoutState = this.layoutStates[index];
            var newLayoutState = JSON.parse(JSON.stringify(lastLayoutState));
            newLayoutState.source = source;
            newLayoutState.action = 1;
            switch (source) {
                case 2:
                    newLayoutState.layout.scrollX = Math.round(element.scrollLeft);
                    newLayoutState.layout.scrollY = Math.round(element.scrollTop);
                    if (lastLayoutState && !this.checkDistance(lastLayoutState, newLayoutState)) {
                        recordEvent = false;
                    }
                    break;
                case 3:
                    newLayoutState.attributes.value = element["value"];
                    break;
                default:
                    break;
            }
            if (recordEvent) {
                this.layoutStates[index] = newLayoutState;
                addEvent({ type: this.eventName, state: newLayoutState });
            }
        }
    };
    Layout.prototype.checkDistance = function (stateOne, stateTwo) {
        var dx = stateOne.layout.scrollX - stateTwo.layout.scrollX;
        var dy = stateOne.layout.scrollY - stateTwo.layout.scrollY;
        return (dx * dx + dy * dy > this.distanceThreshold * this.distanceThreshold);
    };
    Layout.prototype.mutation = function (mutations) {
        if (this.allowMutation()) {
            var time = getTimestamp();
            var summary = this.shadowDom.applyMutationBatch(mutations);
            var actionInfo = {
                action: 1,
                mutationSequence: this.mutationSequence,
                batchSize: mutations.length
            };
            this.checkConsistency(actionInfo);
            if (this.allowMutation()) {
                var events = this.processMutations(summary, time);
                if (this.domDiscoverComplete) {
                    this.processMultipleNodeEvents(events);
                }
                else {
                    this.domPreDiscoverMutations.push(events);
                }
            }
            else {
                debug(">>> ShadowDom doesn't match PageDOM after mutation batch #" + this.mutationSequence + "!");
            }
        }
        this.mutationSequence++;
    };
    Layout.prototype.allowMutation = function () {
        return this.inconsistentShadowDomCount < 2 || !config.validateConsistency;
    };
    Layout.prototype.processMutations = function (summary, time) {
        var events = [];
        for (var i = 0; i < summary.newNodes.length; i++) {
            var node = summary.newNodes[i].node;
            events.push({
                node: node,
                index: getNodeIndex(node),
                source: 1,
                action: 0,
                time: time
            });
        }
        for (var i = 0; i < summary.movedNodes.length; i++) {
            var node = summary.movedNodes[i].node;
            events.push({
                node: node,
                index: getNodeIndex(node),
                source: 1,
                action: 3,
                time: time
            });
        }
        for (var i = 0; i < summary.updatedNodes.length; i++) {
            var node = summary.updatedNodes[i].node;
            events.push({
                node: node,
                index: getNodeIndex(node),
                source: 1,
                action: 1,
                time: time
            });
        }
        for (var i = 0; i < summary.removedNodes.length; i++) {
            var shadowNode = summary.removedNodes[i];
            events.push({
                node: shadowNode.node,
                index: getNodeIndex(shadowNode.node),
                source: 1,
                action: 2,
                time: time
            });
            traverseNodeTree(shadowNode, function (removedShadowNode) {
                delete removedShadowNode.node[NodeIndex];
            });
        }
        return events;
    };
    Layout.prototype.checkConsistency = function (lastActionInfo) {
        if (config.validateConsistency) {
            var domJson = this.shadowDom.createIndexJson(document, function (node) {
                return getNodeIndex(node);
            });
            var shadowDomConsistent = this.shadowDom.isConsistent();
            if (!shadowDomConsistent) {
                this.inconsistentShadowDomCount++;
                var shadowDomJson = this.shadowDom.createIndexJson(this.shadowDom.shadowDocument, function (node) {
                    return parseInt(node.id, 10);
                });
                var evt = {
                    type: 7,
                    dom: domJson,
                    shadowDom: shadowDomJson,
                    lastConsistentShadowDom: this.lastConsistentDomJson,
                    lastAction: lastActionInfo
                };
                if (this.inconsistentShadowDomCount < 2) {
                    this.firstShadowDomInconsistentEvent = evt;
                }
                else {
                    evt.firstEvent = this.firstShadowDomInconsistentEvent;
                    instrument(evt);
                }
            }
            else {
                this.inconsistentShadowDomCount = 0;
                this.firstShadowDomInconsistentEvent = null;
                this.lastConsistentDomJson = domJson;
            }
        }
    };
    return Layout;
}());

var PerformanceProfiler = (function () {
    function PerformanceProfiler() {
        this.dummyHyperlink = document.createElement("a");
        this.timeoutLength = 1000;
        this.stateError = false;
        this.incompleteEntryIndices = [];
    }
    PerformanceProfiler.prototype.activate = function () {
        if (this.timing) {
            this.logTimingTimeout = setTimeout(this.logTiming.bind(this), this.timeoutLength);
        }
        if (this.getEntriesByType) {
            this.logResourceTimingTimeout = setTimeout(this.logResourceTiming.bind(this), this.timeoutLength);
        }
    };
    PerformanceProfiler.prototype.reset = function () {
        this.lastInspectedEntryIndex = -1;
        this.stateError = false;
        this.incompleteEntryIndices = [];
        if (config.uploadUrl) {
            this.dummyHyperlink.href = config.uploadUrl;
            this.clarityHostName = this.dummyHyperlink.hostname;
        }
        this.timing = window.performance && performance.timing;
        this.getEntriesByType = window.performance
            && typeof performance.getEntriesByType === "function"
            && performance.getEntriesByType.bind(performance);
    };
    PerformanceProfiler.prototype.teardown = function () {
        clearTimeout(this.logTimingTimeout);
        clearTimeout(this.logResourceTimingTimeout);
    };
    PerformanceProfiler.prototype.logTiming = function () {
        if (this.timing.loadEventEnd > 0) {
            var formattedTiming_1 = this.timing.toJSON ? this.timing.toJSON() : this.timing;
            formattedTiming_1 = mapProperties(formattedTiming_1, function (name, value) {
                return (formattedTiming_1[name] === 0) ? 0 : Math.round(formattedTiming_1[name] - formattedTiming_1.navigationStart);
            }, false);
            var navigationTimingEventState = {
                timing: formattedTiming_1
            };
            addEvent({ type: "NavigationTiming", state: navigationTimingEventState });
        }
        else {
            this.logTimingTimeout = setTimeout(this.logTiming.bind(this), this.timeoutLength);
        }
    };
    PerformanceProfiler.prototype.logResourceTiming = function () {
        var entries = this.getEntriesByType("resource");
        if (entries.length < this.lastInspectedEntryIndex + 1) {
            if (!this.stateError) {
                this.stateError = true;
                addEvent({ type: "PerformanceStateError", state: {} });
            }
            this.lastInspectedEntryIndex = -1;
            this.incompleteEntryIndices = [];
        }
        var entryInfos = [];
        var incompleteEntryIndicesCopy = this.incompleteEntryIndices.slice();
        this.incompleteEntryIndices = [];
        for (var i = 0; i < incompleteEntryIndicesCopy.length; i++) {
            var entryIndex = incompleteEntryIndicesCopy[i];
            var networkData = this.inspectEntry(entries[entryIndex], entryIndex);
            if (networkData) {
                entryInfos.push(networkData);
            }
        }
        for (var i = this.lastInspectedEntryIndex + 1; i < entries.length; i++) {
            var networkData = this.inspectEntry(entries[i], i);
            if (networkData) {
                entryInfos.push(networkData);
            }
            this.lastInspectedEntryIndex = i;
        }
        if (entryInfos.length > 0) {
            var resourceTimingEventState = {
                entries: entryInfos
            };
            addEvent({ type: "ResourceTiming", state: resourceTimingEventState });
        }
        this.logResourceTimingTimeout = setTimeout(this.logResourceTiming.bind(this), this.timeoutLength);
    };
    PerformanceProfiler.prototype.inspectEntry = function (entry, entryIndex) {
        var networkData = null;
        if (entry && entry.responseEnd > 0) {
            this.dummyHyperlink.href = entry.name;
            if (this.dummyHyperlink.hostname !== this.clarityHostName) {
                networkData = {
                    duration: entry.duration,
                    initiatorType: entry.initiatorType,
                    startTime: entry.startTime,
                    connectStart: entry.connectStart,
                    connectEnd: entry.connectEnd,
                    requestStart: entry.requestStart,
                    responseStart: entry.responseStart,
                    responseEnd: entry.responseEnd,
                    name: entry.name
                };
                if ("transferSize" in entry) {
                    networkData.transferSize = entry.transferSize;
                }
                if ("encodedBodySize" in entry) {
                    networkData.encodedBodySize = entry.encodedBodySize;
                }
                if ("decodedBodySize" in entry) {
                    networkData.decodedBodySize = entry.decodedBodySize;
                }
                networkData = mapProperties(networkData, function (name, value) {
                    return (typeof value === "number") ? Math.round(value) : value;
                }, true);
            }
        }
        else {
            this.incompleteEntryIndices.push(entryIndex);
        }
        return networkData;
    };
    return PerformanceProfiler;
}());

function transform(evt) {
    var de = document.documentElement;
    return [{
            index: 1,
            event: evt.type,
            pointer: "mouse",
            x: "pageX" in evt ? evt.pageX : ("clientX" in evt ? evt.clientX + de.scrollLeft : null),
            y: "pageY" in evt ? evt.pageY : ("clientY" in evt ? evt.clientY + de.scrollTop : null),
            width: 1,
            height: 1,
            pressure: 1,
            tiltX: 0,
            tiltY: 0,
            target: (evt.target && NodeIndex in evt.target) ? evt.target[NodeIndex] : null,
            buttons: evt.buttons
        }];
}


var mouse = Object.freeze({
	transform: transform
});

function transform$1(evt) {
    var states = [];
    var de = document.documentElement;
    var buttons = (evt.type === "touchstart" || evt.type === "touchmove") ? 1 : 0;
    for (var i = 0; i < evt.changedTouches.length; i++) {
        var touch = evt.changedTouches[i];
        states.push({
            index: touch.identifier + 2,
            event: evt.type,
            pointer: "touch",
            x: "clientX" in touch ? touch.clientX + de.scrollLeft : null,
            y: "clientY" in touch ? touch.clientY + de.scrollTop : null,
            width: "radiusX" in touch ? touch["radiusX"] : ("webkitRadiusX" in touch ? touch["webkitRadiusX"] : 0),
            height: "radiusY" in touch ? touch["radiusY"] : ("webkitRadiusY" in touch ? touch["webkitRadiusY"] : 0),
            pressure: "force" in touch ? touch["force"] : ("webkitForce" in touch ? touch["webkitForce"] : 0.5),
            tiltX: 0,
            tiltY: 0,
            target: (evt.target && NodeIndex in evt.target) ? evt.target[NodeIndex] : null,
            buttons: buttons
        });
    }
    return states;
}


var touch = Object.freeze({
	transform: transform$1
});

var Pointer = (function () {
    function Pointer() {
        this.eventName = "Pointer";
        this.distanceThreshold = 20;
        this.timeThreshold = 500;
    }
    Pointer.prototype.activate = function () {
        bind(document, "mousedown", this.pointerHandler.bind(this, mouse));
        bind(document, "mouseup", this.pointerHandler.bind(this, mouse));
        bind(document, "mousemove", this.pointerHandler.bind(this, mouse));
        bind(document, "mousewheel", this.pointerHandler.bind(this, mouse));
        bind(document, "click", this.pointerHandler.bind(this, mouse));
        bind(document, "touchstart", this.pointerHandler.bind(this, touch));
        bind(document, "touchend", this.pointerHandler.bind(this, touch));
        bind(document, "touchmove", this.pointerHandler.bind(this, touch));
        bind(document, "touchcancel", this.pointerHandler.bind(this, touch));
    };
    Pointer.prototype.teardown = function () {
    };
    Pointer.prototype.reset = function () {
        this.lastMoveState = null;
        this.lastMoveTime = 0;
    };
    Pointer.prototype.pointerHandler = function (handler, evt) {
        var states = handler.transform(evt);
        for (var _i = 0, states_1 = states; _i < states_1.length; _i++) {
            var state$$1 = states_1[_i];
            this.processState(state$$1, evt.timeStamp);
        }
    };
    Pointer.prototype.processState = function (state$$1, time) {
        switch (state$$1.event) {
            case "mousemove":
            case "touchmove":
                if (this.lastMoveState == null
                    || this.checkDistance(this.lastMoveState, state$$1)
                    || this.checkTime(time)) {
                    this.lastMoveState = state$$1;
                    this.lastMoveTime = time;
                    addEvent({ type: this.eventName, state: state$$1 });
                }
                break;
            default:
                addEvent({ type: this.eventName, state: state$$1 });
                break;
        }
    };
    Pointer.prototype.checkDistance = function (stateOne, stateTwo) {
        var dx = stateOne.x - stateTwo.x;
        var dy = stateOne.y - stateTwo.y;
        return (dx * dx + dy * dy > this.distanceThreshold * this.distanceThreshold);
    };
    Pointer.prototype.checkTime = function (time) {
        return time - this.lastMoveTime > this.timeThreshold;
    };
    return Pointer;
}());

var Viewport = (function () {
    function Viewport() {
        this.eventName = "Viewport";
        this.distanceThreshold = 20;
    }
    Viewport.prototype.activate = function () {
        this.processState(this.getViewport("discover"));
        bind(window, "scroll", this.viewportHandler.bind(this));
        bind(window, "resize", this.viewportHandler.bind(this));
        bind(window, "pageshow", this.viewportHandler.bind(this));
        bind(window, "pagehide", this.viewportHandler.bind(this));
        bind(document, "visibilitychange", this.viewportHandler.bind(this));
    };
    Viewport.prototype.teardown = function () {
    };
    Viewport.prototype.reset = function () {
        this.lastViewportState = null;
    };
    Viewport.prototype.viewportHandler = function (evt) {
        var viewportState = this.getViewport(evt.type);
        this.processState(viewportState);
    };
    Viewport.prototype.getViewport = function (type) {
        var de = document.documentElement;
        var body = document.body;
        var viewport = {
            viewport: {
                x: "pageXOffset" in window ? window.pageXOffset : de.scrollLeft,
                y: "pageYOffset" in window ? window.pageYOffset : de.scrollTop,
                width: "innerWidth" in window ? window.innerWidth : de.clientWidth,
                height: "innerHeight" in window ? window.innerHeight : de.clientHeight
            },
            document: {
                width: body ? body.clientWidth : null,
                height: body ? body.clientHeight : null
            },
            dpi: "devicePixelRatio" in window ? window.devicePixelRatio : -1,
            visibility: "visibilityState" in document ? document.visibilityState : "default",
            event: type
        };
        return viewport;
    };
    Viewport.prototype.processState = function (state$$1) {
        var recordState = true;
        if (state$$1.event === "scroll"
            && this.lastViewportState !== null
            && !this.checkDistance(this.lastViewportState, state$$1)) {
            recordState = false;
        }
        if (recordState) {
            this.lastViewportState = state$$1;
            addEvent({ type: this.eventName, state: state$$1 });
        }
    };
    Viewport.prototype.checkDistance = function (stateOne, stateTwo) {
        var dx = stateOne.viewport.x - stateTwo.viewport.x;
        var dy = stateOne.viewport.y - stateTwo.viewport.y;
        return (dx * dx + dy * dy > this.distanceThreshold * this.distanceThreshold);
    };
    return Viewport;
}());

var classes = { layout: Layout, viewport: Viewport, pointer: Pointer, performance: PerformanceProfiler, errors: ErrorMonitor };
function getPlugin(name) {
    return classes[name];
}

var version = "0.1.14";
var Cookie = "ClarityID";
var ClarityAttribute = "clarity-iid";
var startTime;
var cid;
var impressionId;
var sequence;
var envelope;
var activePlugins;
var bindings;
var sentBytesCount;
var uploadCount;
var eventCount;
var droppedPayloads;
var pendingEvents = [];
var pendingUploads;
var queueUploads;
var compressionWorker;
var timeout;
var state = 0;
function activate() {
    try {
        init();
    }
    catch (e) {
        onActivateErrorUnsafe(e);
    }
    try {
        var readyToActivatePlugins = prepare();
        if (readyToActivatePlugins) {
            activatePlugins();
            state = 1;
        }
        else {
            teardown();
        }
    }
    catch (e) {
        onActivateError(e);
    }
}
function teardown() {
    for (var _i = 0, activePlugins_1 = activePlugins; _i < activePlugins_1.length; _i++) {
        var plugin = activePlugins_1[_i];
        plugin.teardown();
    }
    for (var evt in bindings) {
        if (bindings.hasOwnProperty(evt)) {
            var eventBindings = bindings[evt];
            for (var i = 0; i < eventBindings.length; i++) {
                (eventBindings[i].target).removeEventListener(evt, eventBindings[i].listener);
            }
        }
    }
    delete document[ClarityAttribute];
    if (compressionWorker) {
        compressionWorker.terminate();
    }
    state = 2;
    instrument({ type: 4 });
    uploadPendingEvents();
}
function bind(target, event, listener) {
    var eventBindings = bindings[event] || [];
    target.addEventListener(event, listener, false);
    eventBindings.push({
        target: target,
        listener: listener
    });
    bindings[event] = eventBindings;
}
function addEvent(event, scheduleUpload) {
    if (scheduleUpload === void 0) { scheduleUpload = true; }
    var evt = {
        id: eventCount++,
        time: isNumber(event.time) ? event.time : getTimestamp(),
        type: event.type,
        state: event.state
    };
    var addEventMessage = {
        type: 0,
        event: evt,
        time: getTimestamp()
    };
    if (compressionWorker) {
        compressionWorker.postMessage(addEventMessage);
    }
    pendingEvents.push(evt);
    if (scheduleUpload) {
        clearTimeout(timeout);
        timeout = setTimeout(forceCompression, config.delay);
    }
}
function addMultipleEvents(events) {
    if (events.length > 0) {
        for (var i = 0; i < events.length - 1; i++) {
            addEvent(events[i], false);
        }
        var lastEvent = events[events.length - 1];
        addEvent(lastEvent, true);
    }
}
function onTrigger() {
    if (state === 1) {
        queueUploads = false;
        for (var i = 0; i < pendingUploads.length; i++) {
            var uploadInfo = pendingUploads[i];
            upload(uploadInfo.payload, uploadInfo.onSuccess, uploadInfo.onFailure);
        }
        pendingUploads = [];
    }
}
function forceCompression() {
    if (compressionWorker) {
        var forceCompressionMessage = {
            type: 1,
            time: getTimestamp()
        };
        compressionWorker.postMessage(forceCompressionMessage);
    }
}
function getTimestamp(unix, raw) {
    var time = unix ? getUnixTimestamp() : getPageContextBasedTimestamp();
    return (raw ? time : Math.round(time));
}
function instrument(eventState) {
    if (config.instrument) {
        addEvent({ type: "Instrumentation", state: eventState });
    }
}
function onWorkerMessage(evt) {
    if (state !== 2) {
        var message = evt.data;
        switch (message.type) {
            case 2:
                var uploadMsg_1 = message;
                var onSuccess = function (status) { mapProperties(droppedPayloads, uploadDroppedPayloadsMappingFunction, true); };
                var onFailure = function (status) { onFirstSendDeliveryFailure(status, uploadMsg_1.rawData, uploadMsg_1.compressedData); };
                if (queueUploads) {
                    var uploadInfo = {
                        payload: uploadMsg_1.compressedData,
                        onSuccess: onSuccess,
                        onFailure: onFailure
                    };
                    pendingUploads.push(uploadInfo);
                }
                else {
                    upload(uploadMsg_1.compressedData, onSuccess, onFailure);
                }
                pendingEvents.splice(0, uploadMsg_1.eventCount);
                sequence++;
                break;
            default:
                break;
        }
    }
}
function getUnixTimestamp() {
    return (window.performance && performance.now && performance.timing)
        ? performance.now() + performance.timing.navigationStart
        : new Date().getTime();
}
function getPageContextBasedTimestamp() {
    return (window.performance && performance.now)
        ? performance.now()
        : new Date().getTime() - startTime;
}
function uploadDroppedPayloadsMappingFunction(sequenceNumber, droppedPayloadInfo) {
    var onSuccess = function (status) { onResendDeliverySuccess(droppedPayloadInfo); };
    var onFailure = function (status) { onResendDeliveryFailure(status, droppedPayloadInfo); };
    upload(droppedPayloadInfo.payload, onSuccess, onFailure);
}
function upload(payload, onSuccess, onFailure) {
    var uploadHandler = config.uploadHandler || defaultUpload;
    uploadHandler(payload, onSuccess, onFailure);
    debug("** Clarity #" + uploadCount + ": Uploading " + Math.round(payload.length / 1024.0) + "KB (Compressed). **");
    uploadCount++;
    sentBytesCount += payload.length;
    if (state === 1 && sentBytesCount > config.totalLimit) {
        var totalByteLimitExceededEventState = {
            type: 3,
            bytes: sentBytesCount
        };
        instrument(totalByteLimitExceededEventState);
        teardown();
    }
}
function defaultUpload(payload, onSuccess, onFailure) {
    if (config.uploadUrl.length > 0) {
        payload = JSON.stringify(payload);
        var xhr_1 = new XMLHttpRequest();
        xhr_1.open("POST", config.uploadUrl);
        xhr_1.setRequestHeader("Content-Type", "application/json");
        xhr_1.onreadystatechange = function () { onXhrReadyStatusChange(xhr_1, onSuccess, onFailure); };
        xhr_1.send(payload);
    }
}
function onXhrReadyStatusChange(xhr, onSuccess, onFailure) {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status < 200 || xhr.status > 208) {
            onFailure(xhr.status);
        }
        else {
            onSuccess(xhr.status);
        }
    }
}
function onFirstSendDeliveryFailure(status, rawPayload, compressedPayload) {
    var sentObj = JSON.parse(rawPayload);
    var xhrErrorEventState = {
        type: 2,
        requestStatus: status,
        sequenceNumber: sentObj.envelope.sequenceNumber,
        compressedLength: compressedPayload.length,
        rawLength: rawPayload.length,
        firstEventId: sentObj.events[0].id,
        lastEventId: sentObj.events[sentObj.events.length - 1].id,
        attemptNumber: 0
    };
    droppedPayloads[xhrErrorEventState.sequenceNumber] = {
        payload: compressedPayload,
        xhrErrorState: xhrErrorEventState
    };
    instrument(xhrErrorEventState);
    sentBytesCount -= compressedPayload.length;
}
function onResendDeliveryFailure(status, droppedPayloadInfo) {
    droppedPayloadInfo.xhrErrorState.requestStatus = status;
    droppedPayloadInfo.xhrErrorState.attemptNumber++;
    instrument(droppedPayloadInfo.xhrErrorState);
}
function onResendDeliverySuccess(droppedPayloadInfo) {
    delete droppedPayloads[droppedPayloadInfo.xhrErrorState.sequenceNumber];
}
function uploadPendingEvents() {
    if (pendingEvents.length > 0) {
        envelope.sequenceNumber = sequence++;
        envelope.time = getTimestamp();
        var raw = JSON.stringify({ envelope: envelope, events: pendingEvents });
        var compressed = compress(raw);
        var onSuccess = function (status) { };
        var onFailure = function (status) { };
        upload(compressed, onSuccess, onFailure);
    }
}
function init() {
    if (!getCookie(Cookie)) {
        setCookie(Cookie, guid());
    }
    cid = getCookie(Cookie);
    impressionId = guid();
    startTime = getUnixTimestamp();
    sequence = 0;
    envelope = {
        clarityId: cid,
        impressionId: impressionId,
        url: window.location.href,
        version: version
    };
    activePlugins = [];
    bindings = {};
    droppedPayloads = {};
    pendingEvents = [];
    pendingUploads = [];
    queueUploads = config.waitForTrigger;
    sentBytesCount = 0;
    uploadCount = 0;
    eventCount = 0;
    compressionWorker = createCompressionWorker(envelope, onWorkerMessage);
}
function prepare() {
    if (!checkFeatures()) {
        return false;
    }
    if (document[ClarityAttribute]) {
        var eventState = {
            type: 6,
            currentImpressionId: document[ClarityAttribute]
        };
        instrument(eventState);
        return false;
    }
    document[ClarityAttribute] = impressionId;
    bind(window, "beforeunload", teardown);
    bind(window, "unload", teardown);
    return true;
}
function activatePlugins() {
    for (var _i = 0, _a = config.plugins; _i < _a.length; _i++) {
        var plugin = _a[_i];
        var pluginClass = getPlugin(plugin);
        if (pluginClass) {
            var instance = new (pluginClass)();
            instance.reset();
            instance.activate();
            activePlugins.push(instance);
        }
    }
}
function onActivateErrorUnsafe(e) {
    try {
        onActivateError(e);
    }
    catch (e) {
    }
}
function onActivateError(e) {
    var clarityActivateError = {
        type: 8,
        error: e.message
    };
    instrument(clarityActivateError);
    teardown();
}
function checkFeatures() {
    var missingFeatures = [];
    var expectedFeatures = [
        "document.implementation.createHTMLDocument",
        "document.documentElement.classList",
        "Function.prototype.bind",
        "window.Worker"
    ];
    for (var _i = 0, expectedFeatures_1 = expectedFeatures; _i < expectedFeatures_1.length; _i++) {
        var feature = expectedFeatures_1[_i];
        var parts = feature.split(".");
        var api = window;
        for (var _a = 0, parts_1 = parts; _a < parts_1.length; _a++) {
            var part = parts_1[_a];
            if (typeof api[part] === "undefined") {
                missingFeatures.push(feature);
                break;
            }
            api = api[part];
        }
    }
    if (missingFeatures.length > 0) {
        instrument({
            type: 1,
            missingFeatures: missingFeatures
        });
        return false;
    }
    return true;
}
bindings = {};

function start(customConfig) {
    if (state !== 1) {
        mapProperties(customConfig, null, true, config);
        activate();
    }
}
function stop() {
    teardown();
}
function trigger() {
    onTrigger();
}

exports.start = start;
exports.stop = stop;
exports.trigger = trigger;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}]},{},[1]);
