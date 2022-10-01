'use strict';
import { CommunityGamesClient, communitygames } from 'bfportal-grpc';

let sessionId;

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages


async function getCookie(sendResponse) {
  let cookie = await browser.cookies.get({url: "https://portal.battlefield.com", name: "sessionId"});
  sessionId = cookie.value;
  sendResponse(cookie.value);
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status == "complete" && changeInfo.url == "https://portal.battlefield.com/experiences") {
    console.log(tabId, tab)
  }
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.type) {
      case "getPlayground":
        copyPlayground(request.playgroundId, sendResponse)
        break;
    
      default:
        getCookie(sendResponse);
        break;
    }
    return true
  }
);

async function copyPlayground(playgroundId, sendResponse) {
  const communityGames = new CommunityGamesClient('https://kingston-prod-wgw-envoy.ops.dice.se', null);
  const metadata = {
      'x-dice-tenancy': 'prod_default-prod_default-kingston-common',
      'x-gateway-session-id': sessionId,
      'x-grpc-web': '1',
      'x-user-agent': 'grpc-web-javascript/0.1',
  }
  
  const request = new communitygames.GetPlaygroundRequest();
  request.setPlaygroundid(playgroundId);
  const response = await communityGames.getPlayground(request, metadata);
  const modRules = response.getPlayground()?.getOriginalplayground()?.getModrules()?.getCompatiblerules()?.getRules();
  if (modRules instanceof Uint8Array) {
      console.log(new TextDecoder().decode(modRules))
  }
  const playgroundName = response.getPlayground()?.getOriginalplayground()?.getName();

  console.log(playgroundName)
  sendResponse(playgroundName);
}
