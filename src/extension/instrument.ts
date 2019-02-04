
import { ClarityJs } from "clarity-js";

const CLARITY_JS_EVENT_TYPE = "CLARITY_JS";
const INSERT_RULE_EVENT_NAME = "INSERT_RULE";

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
          const stylesheet = <CSSStyleSheet>document.styleSheets[event.data.stylesheetIndex];
          if (stylesheet) {
              stylesheet.insertRule(event.data.style, event.data.index);
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
      CSSStyleSheet.prototype.insertRule = function (style, index) {
          let value = _insertRule.call(this, style, index);
          let ssIndex = getStylesheetIndex(this);
          let data = {
              type: CLARITY_JS_EVENT_TYPE,
              event: INSERT_RULE_EVENT_NAME,
              stylesheetIndex: ssIndex,
              style,
              index
          };
          window.postMessage(data, "*");
          return value;
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
