
## Overview
This is a Chrome extension for Clarity. It allows you to instrument data from any web-site and also consumes the recorded data to replay your session visualization. This extension is built as part of the standard build procedure and wraps existing code in Chrome extension format.

## How to use the extension?
- First build everything:  `npm run build`
- You will now have chrome extension built under: `build\extension`
- To install chrome extensions locally, you will need to follow these steps:
  - Open chrome
  - Go to settings -> extensions
  - Check 'Developer mode'
  - Click 'Load unpacked extension...' and select `build/extension` folder
- The extension will now be loaded for your Chrome instance, and will continue to stay there
- Now navigate to any web-site, extension will instrument data automatically - no buttons to press
- When you are ready to replay the session, click on the extension icon and it will open a popup that has a link to replay
