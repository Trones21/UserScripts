// ==UserScript==
// @name         Connections Value
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.linkedin.com/search/results/people/*
// @grant        window.onurlchange
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

//Need to figure out how to get this to run when switching pages (without using a button)
//Try this with jquery first

(async()=>{

    console.log('loaded')

    let IDs = Array.from(document.querySelectorAll('.entity-result__title-text > a')).map((i)=>i.getAttribute('href').slice(27).replace("/", ''))

    await Promise.all(IDs.map(async(ID)=>{
        const headers = {"headers": {
                                  //0654649173688246110
                "csrf-token": "ajax:0654649173688246110",
            },
            "mode": "cors",
            "credentials": "include"
            }

       const netRes = await fetch("https://www.linkedin.com/voyager/api/identity/profiles/" + ID + "/networkinfo", headers);
       const networkInfoData = await(netRes.json());
       //console.log(networkInfoData);
       let networkinfo = document.createElement("div");
       networkinfo.innerText = "Followers: " + networkInfoData.followersCount;


       //profileUrn formatted like this - urn%3Ali%3Afsd_profile%3AACoAAAzFhwEBug9lp9mZersl336pfd_p0uWTRQs
       const profileUrnClean = networkInfoData.entityUrn.split(':')[3];
       const profileUrn = "urn%3Ali%3Afsd_profile%3A" + profileUrnClean;
       //console.log(profileUrn);
       const likeRes = await fetch("https://www.linkedin.com/voyager/api/identity/profileUpdatesV2?count=10" +
                                   "&includeLongTermHistory=true&moduleKey=member-activity%3Aphone&profileUrn=" + profileUrn + "&q=memberFeed&start=10", headers);
       const activityData = await(likeRes.json());
        console.log(activityData);
       let activityInfo = extractActivityInfo(activityData);
       console.log(activityInfo);
       let likes = document.createElement('div');

       let container = document.createElement('div');
       container.appendChild(activityInfo);
       container.appendChild(networkinfo);


       let parentEl = document.querySelector('.entity-result__title-text > a[href="https://www.linkedin.com/in/'+ID+'"]').parentElement;
       parentEl.appendChild(container)
       

    }
    ))

}
)()

function extractActivityInfo(activityData){
    //Note: Shares & Reshares do not have Headers
    if(activityData.elements.length !== 0){
        let commentsAndReactions = activityData.elements.filter(i => i.header.text.text),
        let shares: "";
        return {
        totalCount: activityData.elements.length,
        //: likeData.filter(i => i.resharedUpdate).length,
        commentsCount: commentsAndReactions.filter(i => i.match(/commented/g)).length,
        reactionsToPostCount: commentsAndReactions.filter(i => i.match(/likes|celebrates|loves|supports/g)).length,
        reactionsToCommentCount: commentsAndReactions.filter(i => i.match(/like|celebrate|love|support|insightful|curious/g) && i.match(/comment/g)).length,
        shareCount: "To Implement",
        reshareCount: "To Implement",
        mostRecentActivity: likeData.elements[0].actor.subDescription.text.trim(),

        //firstActivityInRange: likeData.elements.lastObject.actor.subDescription.text.trim()
        }
    }
    else {
    return "No Activity"
    }
}


function activityStyle(activityCount){
    if(activityCount === 0){
        return "color:red; font-weight:600;"
    }
    else if(activityCount === 6){
        return "color:green; font-weight:600;"
    }
    else{
        return ""
    }
}

/*
Original implementation of the activity data whioch didnt include likes or differentiate between
type of activity
       const actRes = await fetch("https://www.linkedin.com/voyager/api/identity/profiles/" + ID + "/recentActivities", headers);
       const ad = await(actRes.json());
       let d = document.createElement("div");
       d.innerText = "Deprecated: " + d.elements.length;
       d.style = d(d.elements.length);
    }
*/