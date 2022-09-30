'use strict';
import './contentScript.css';
import { CommunityGamesClient, communitygames } from 'bfportal-grpc';

function waitForElm(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              resolve(document.querySelector(selector));
              observer.disconnect();
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}

async function copyPlayground(sessionId, playgroundId) {
    const communityGames = new CommunityGamesClient('https://kingston-prod-wgw-envoy.ops.dice.se', null);
    const metadata = {
        'x-dice-tenancy': 'prod_default-prod_default-kingston-common',
        'x-gateway-session-id': sessionId,
        'x-grpc-web': '1',
        'x-user-agent': 'grpc-web-javascript/0.1',
    }
    
    const request = new communitygames.GetPlaygroundRequest();
    request.setPlaygroundid(playgroundId);
    console.log(response)
    const response = await communityGames.getPlayground(request, metadata);
    const modRules = response.getPlayground()?.getOriginalplayground()?.getModrules()?.getCompatiblerules()?.getRules();
    if (modRules instanceof Uint8Array) {
        console.log(new TextDecoder().decode(modRules))
    }
    const playgroundName = response.getPlayground()?.getOriginalplayground()?.getName();

    console.log(playgroundName)
}

waitForElm('.info-wrapper').then((element) => {
    chrome.runtime.sendMessage({ type: "getCookie" }, function (response) {
        let item = document.querySelectorAll(".experience-card");
        item.forEach(e => {
            const playgroundId = new URLSearchParams(e.querySelector("a").search).get("playgroundId")

            let item = e.querySelector(".image-section");
            let itemList = document.createElement("div");
            itemList.classList.add("itemlist-location");
            let copyBtn = document.createElement("i");
            copyBtn.classList.add("gg-copy");
            copyBtn.onclick=async () => {await copyPlayground(response, playgroundId)};
            let trashBtn = document.createElement("i");
            trashBtn.classList.add("gg-trash");

            itemList.append(copyBtn, trashBtn);
            item.prepend(itemList);
        });
    });

});
