// ==UserScript==
// @name         StackOverflow - Show Self Answered Questions
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      https://stackoverflow.com/users/*/*?tab=ans*
// @grant        none
// ==/UserScript==

(function() {
    //Create divs for "Own Question" Attribute
    let prevSiblingsList = document.querySelectorAll(".answer-summary > div.answer-link");
    
    for(let prevSibling of prevSiblingsList){
        let isOwnBox = document.createElement("div");
        isOwnBox.className = "isOwnBox";
        isOwnBox.innerText = "N/A";
        prevSibling.insertAdjacentElement("afterend", isOwnBox);
    
    }
    
    let profileId = document.querySelector(".js-user-tab-sorts > a").getAttribute("href").split("/")[2]
    let links = Array.from(document.querySelectorAll("div.answer-link > a")).map((i)=>(i.href))
    
    //Loop through links, modify UI
    for(let link of links){
        fetch(link).then(async(res)=>{ let html= await res.text(); return {html:html, url:res.url}}).then((data)=>{
            console.log(link)
            let parser = new DOMParser();
            let doc = parser.parseFromString(data.html, "text/html");
            let questionEl = doc.querySelector(".question");
            let postAuthorId = (questionEl.querySelectorAll(".user-details > a").length === 1)?
            questionEl.querySelectorAll(".user-details > a")[0].getAttribute("href").split("/")[2] :
            questionEl.querySelectorAll(".user-details > a")[1].getAttribute("href").split("/")[2]
            console.log(profileId+ " : " + postAuthorId)
    
            if(profileId === postAuthorId){
                let questionId = data.url.split("/")[4]
                document.querySelector(".answer-link > a[href*='" + questionId + "']").parentElement.parentElement.querySelector(".isOwnBox").innerText = "(Own Question)"
            }
        })
    }
    })();