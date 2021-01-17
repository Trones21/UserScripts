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

    let IDs = Array.from(document.querySelectorAll('.entity-result__title-text > a')).map((i)=>i.getAttribute('href').slice(27).replace("/", ''));
    //Sometimes the script loads too quickly -- not the ideal solution, but it works
    if(IDs.length !== 10){
      await sleep(2000)
      IDs = Array.from(document.querySelectorAll('.entity-result__title-text > a')).map((i)=>i.getAttribute('href').slice(27).replace("/", ''));
    }

    //Main
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
       if(!sanityCheck_TotalEqualsSum(activityInfo)){console.log(activityData);};
       //console.log(activityInfo);
       let activityDiv = document.createElement('div');

       let container = document.createElement('div');
       container.appendChild(activityDiv);
       container.appendChild(networkinfo);


       let parentEl = document.querySelector('.entity-result__title-text > a[href="https://www.linkedin.com/in/'+ID+'"]').parentElement;
       parentEl.appendChild(container)
       

    }
    ))

}
)()

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function extractActivityInfo(activityData){

    if(activityData.elements.length !== 0){
        //Note: Shares & Reshares do not have Headers, but comments, reactions, replies to comments do.
        let commentsReactionsReplies = activityData.elements.reduce((filtered, i) => { if(i.header){ filtered.push(i.header.text.text)}; return filtered}, []);
        let shares = activityData.elements.reduce((filtered, i) => { if(!i.header){if(i.commentary || i.content){filtered.push(i)}}; return filtered}, []);
        let reshares = activityData.elements.reduce((filtered, i) => { if(!i.header){if(i.resharedUpdate){filtered.push(i)}}; return filtered}, []);

        //I do not know how to get the actual date a share was liked, only the date it was shared.
        //But I generally don't see posts in my feed more than a week old (tested on fake and real profile).
        //However, a one week range is ok. And a post must be shared before it is liked, so the share date is the maximum time since like. Remember our goal is just to understand how active someone is on LinkedIn.
        //Idea - group activities by date
        //- ex. last 24 hours, last week, last month,  last 3 months,
        //Should i split the activities by type?

        return {
        totalCount: activityData.elements.length,

        commentsCount: (commentsReactionsReplies.length !== 0)? commentsReactionsReplies.filter(i => i.match(/commented/g)).length : 0,
        repliesToCommentsCount: (commentsReactionsReplies.length !== 0)? commentsReactionsReplies.filter(i => i.match(/replied/g)).length : 0,
        reactionsToPostCount: (commentsReactionsReplies.length !== 0)? commentsReactionsReplies.filter(i => i.match(/likes|celebrates|loves|supports/g)).length: 0,
        reactionsToCommentCount: (commentsReactionsReplies.length !== 0)? commentsReactionsReplies.filter(i => i.match(/like|celebrate|love|support|insightful|curious/g) && i.match(/comment/g)).length: 0,

        shareCount: (shares.length !== 0)? shares.length : 0,
        reshareCount:(reshares.length !== 0)? reshares.length : 0,

        //This is not accurate
        mostRecentActivity: activityData.elements[0].actor.subDescription.text.trim(),


        //firstActivityInRange: activityData.elements.lastObject.actor.subDescription.text.trim()
        };

    }

    else {
    return "No Activity";
    }
}



function sanityCheck_TotalEqualsSum(activityInfo){
  let a = activityInfo;
       if(a !=="No Activity"){
           let sum = a.commentsCount + a.reactionsToPostCount + a.reactionsToCommentCount + a.repliesToCommentsCount + a.shareCount + a.reshareCount;
         if(a.totalCount !== sum){
             console.log("Not Equal -- TotalCount is: " + a.totalCount + " but Sum of components is:  " + sum);
             console.log(activityInfo);
             return false;
           }

       }
    return true;

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