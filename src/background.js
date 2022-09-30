'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages


async function sendFoo(sendResponse) {
  let cookie = await browser.cookies.get({url: "https://portal.battlefield.com", name: "sessionId"});
  sendResponse(cookie.value);
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type === "getCookie") {
      sendFoo(sendResponse)
      return true
    }
  }
);