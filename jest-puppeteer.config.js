const debug = !!process.env["DEBUG"];
const path = require('path');

module.exports = {
  launch: {
    headless: debug ? false : true,
    devtools: debug ? true : false,
    slowMo: debug ? 500 : 0,
    args: [
      "--enable-logging",
      "--log-file=" + path.join(process.cwd(), 'chrome.log'),
    ]
  },
  server: {
    command: "PORT=3232 BROWSER=none yarn start",
    port: 3232,
    launchTimeout: 30 * 1000,
    debug: true,
    usedPortAction: "ask",
  },
};
