
import { ClarityJs } from "clarity-js";

const CLARITY_JS_EVENT_TYPE = "CLARITY_JS";
const INSERT_RULE_EVENT_NAME = "INSERT_RULE";
const DELETE_RULE_EVENT_NAME = "DELETE_RULE";

chrome.runtime.sendMessage({ status: true }, function (response) {
  if (response.active) {
    chrome.storage.sync.get({
      clarity: { showText: false, showImages: true, showLinks: true, enabled: true }
    }, function (items: any) {
      if (items.clarity.enabled) {
        prepareEnvironment();
        ClarityJs.start({
          showText: items.clarity.showText,
          showLinks: items.clarity.showLinks,
          showImages: items.clarity.showImages,
          uploadHandler: upload,
          instrument: true
        });
      }
    });
  }
});

function prepareEnvironment() {
    window.addEventListener("message", function (event) {

      // Only accept messages from ourselves
      if (!(event.source == window && event.data.type && event.data.type === CLARITY_JS_EVENT_TYPE)) {
          return;
      }

      if (event.data.event === INSERT_RULE_EVENT_NAME) {
        console.warn("Inserting style rule");
        const stylesheet = <CSSStyleSheet>document.styleSheets[event.data.stylesheetIndex];
        if (stylesheet) {
            stylesheet.insertRule(event.data.style, event.data.index);
        } else {
            console.warn("Stylesheet not found");
        }
      }

      if (event.data.event === DELETE_RULE_EVENT_NAME) {
        const stylesheet = <CSSStyleSheet>document.styleSheets[event.data.stylesheetIndex];
        console.warn("Deleting style rule");
        if (stylesheet) {
            stylesheet.deleteRule(event.data.index);
        } else {
            console.warn("Stylesheet not found");
        }
    }
  });
  let script = document.createElement("script");
  let scriptCode = getPageScriptCode();
  script.innerHTML = scriptCode;
  document.body.appendChild(script);
}


function upload(payload, onSuccess, onFailure) {
  chrome.runtime.sendMessage({ payload: payload }, function (response) {
    if (response.success) {
      onSuccess();
    } else {
      console.warn("Clarity failed to receive the payload.");
      onFailure();
    }
  });
}


function getPageScriptCode() {
  let closureFn = function () {
      let _insertRule = CSSStyleSheet.prototype.insertRule;
      let _deleteRule = CSSStyleSheet.prototype.deleteRule;
      CSSStyleSheet.prototype.insertRule = function (style, index) {
          let value = _insertRule.call(this, style, index);
          let ssIndex = getStylesheetIndex(this);
          let data = {
              type: "CLARITY_JS",
              event: "INSERT_RULE",
              stylesheetIndex: ssIndex,
              style,
              index
          };
          window.postMessage(data, "*");
          return value;
      };

      CSSStyleSheet.prototype.deleteRule = function (index) {
        _deleteRule.call(this, index);
        let ssIndex = getStylesheetIndex(this);
        let data = {
          type: "CLARITY_JS",
          event: "DELETE_RULE",
          stylesheetIndex: ssIndex,
          index
        };
        window.postMessage(data, "*");
    };

      function getStylesheetIndex(ss: CSSStyleSheet) {
          let all = document.styleSheets;
          for (let i = 0; i < all.length; i++) {
              if (all[i] === ss) {
                  return i;
              }
          }
          return -1;
      }
  };
  return `(${closureFn.toString()})();`;
}
