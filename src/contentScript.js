'use strict';
import './contentScript.css';

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
            copyBtn.onclick=async () => {await chrome.runtime.sendMessage({ type: "getPlayground", playgroundId: playgroundId })};
            let trashBtn = document.createElement("i");
            trashBtn.classList.add("gg-trash");

            itemList.append(copyBtn, trashBtn);
            item.prepend(itemList);
        });
    });

});
