console.log("Connections Value script running")
'use strict';
//Create CSS Classes
function createClass(name,rules){
    var style = document.createElement('style');
    style.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(style);
    if(!(style.sheet||{}).insertRule) 
        (style.styleSheet || style.sheet).addRule(name, rules);
    else
        style.sheet.insertRule(name+"{"+rules+"}",0);
}
createClass('.tableBar',"background-color:#0084bf;");


asyncMain();

//Tested up to 100 -- Only uses 1 request 
let ActivitiesToGet = 50;
let maxActivities = ActivitiesToGet; //for convienence we sometimes want to use diff names for this
let pctActivityThreshold = 0.9;

async function asyncMain() {

    let divs = Array.from(document.querySelectorAll('.entity-result__title-text > a'));
    //Sometimes the script loads too quickly -- not the ideal solution, but it works
    if (divs.length !== 10) {
        await sleep(2000)
        divs = Array.from(document.querySelectorAll('.entity-result__title-text > a'));
    }

    preUImods()
    addScriptInfoPopup(maxActivities, pctActivityThreshold)
    addScriptOptionsMenu()

    //Main
    //No Access to "LinkedIn Member" Divs
    let IDs = divs.reduce((filtered,i)=>{
        if (i.innerText !== "LinkedIn Member") {
            filtered.push(i.getAttribute('href').slice(27).replace("/", ''))
        } else {
            i.innerText = i.innerText + " (No Profile Access)"
        }
        ;return filtered
    }
    , []);
    IDs = IDs.slice(0, 2);

    await Promise.all(IDs.map(async(ID)=>{
        const headers = {
            "headers": {
                "csrf-token": "ajax:0654649173688246110",
            },
            "mode": "cors",
            "credentials": "include"
        }

        //Get Network Info & Extract profileUrn
        const netRes = await fetch("https://www.linkedin.com/voyager/api/identity/profiles/" + ID + "/networkinfo", headers);
        const networkInfoData = await (netRes.json());
        let networkinfo = document.createElement("div");
        networkinfo.innerText = "Followers: " + networkInfoData.followersCount;
        //profileUrn formatted like this - urn%3Ali%3Afsd_profile%3AACoAAAzFhwEBug9lp9mZersl336pfd_p0uWTRQs
        const profileUrnClean = networkInfoData.entityUrn.split(':')[3];
        const profileUrn = "urn%3Ali%3Afsd_profile%3A" + profileUrnClean;

        //Get Activity
        const actRes = await fetch("https://www.linkedin.com/voyager/api/identity/profileUpdatesV2?count=" + ActivitiesToGet + "&includeLongTermHistory=true&moduleKey=member-activity%3Aphone&profileUrn=" + profileUrn + "&q=memberFeed&start=0", headers);
        const activityData = await (actRes.json());
        let stats = extractActivityInfo(activityData);

        //Create Container for My Content
        let activityContainer = document.createElement('div');
        activityContainer.id = "activityContainer";
        activityContainer.style = 'background-color:DarkGray'

        if (stats !== "Failed Sanity Check") {
            //DetermineActivityLevel
            let activityLevelDiv = styleActivityLevel(determineActivityLevel(stats, maxActivities, pctActivityThreshold));
            activityContainer.appendChild(activityLevelDiv);
        } else {
            activityContainer.appendChild(createElement("div", "Failed Sanity Check"))
        }

        //Create Table
        let uiReadyStats = transformStatsForUi(stats, maxActivities);
        let activityTable = buildTable(uiReadyStats)
        activityContainer.appendChild(activityTable);

        //Add to UI
        let container = document.createElement('div');
        container.appendChild(activityContainer);
        container.appendChild(networkinfo);

        //Select correct person div
        let entity = document.querySelector('.entity-result__title-text > a[href="https://www.linkedin.com/in/' + ID + '"]').parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        entity.style.maxWidth = "none";
        entity.children[1].style.maxWidth = "40%";

        //Insert container before the Connect/Message Button
        entity.insertBefore(container, entity.children[2]);

    }
    ))

}

/******************************    General Helpers (Not Specific to This Script    *******************************/

function sleep(time) {
    return new Promise((resolve)=>setTimeout(resolve, time));
}

function createElement(type, innerTextMsg, style="") {
    let x = document.createElement(type);
    x.innerText = innerTextMsg;
    x.setAttribute('style', style);
    return x;
}

function flatten(data) {
    var result = {};
    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop ? prop + "." + i : "" + i);
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "." + p : p);
            }
            if (isEmpty)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

/******************************************************************************************************************/

/******************************    Supporting Functions (For this Script)    *******************************/

function addScriptInfoPopup(maxActivities, threshold){
    let infoPopup = createElement("div");
    infoPopup.innerText = `
    This script gets the last ${maxActivities} activities by a user. We call this number maxActivities. 
    The actviity level is determined by the number of activities performed in particular timeframes.
    Very Active: >${threshold*100}% of maxActivities performed in last Week 
    Active: >${threshold*100}% of maxActivities performed in last Month
    Somewhat Active: >${threshold*100}% of maxActivities performed in last Quarter 
    Rarely Active: >${threshold*100}% of maxActivities performed in last Year
    Not Active: <${threshold*100}% of maxActivities performed in last Year
    `
}

function addScriptOptionsMenu(){
   console.log("Implement later - addScriptOptionsMenu");
}

function buildTable(uiReadyStats) {
    let activityTable = document.createElement('table');
    activityTable.style = 'border-collapse: separate; border-spacing:8px 1px'

    let colStyling = document.createElement('colgroup')
    colStyling.innerHTML = `
<col span='1' style="background-color:">
`

    let headersRow = document.createElement('thead');
    headersRow.innerHTML = `
<tr>
  <th> </th>
  <th>Reactions</th>
  <th>Comments</th>
  <th>Replies</th>
  <th>ReShares</th>
  <th>Shares</th>
</tr>
`

    //Refactor to loop rather than set all explicitly
    let tbody = document.createElement('tbody');
    tbody.innerHTML = `
  <tr class="week">
    <td>Week</td>
    <td class="reactions">
    <div class="tableBar" style="width:${uiReadyStats.reactions.week.barWidth};">
        ${uiReadyStats.reactions.week.val}
    </div>
    </td>
    <td class="comments">
    <div class="tableBar" style="width:${uiReadyStats.comments.week.barWidth};">
        ${uiReadyStats.comments.week.val}
    </div>
    </td>
    <td class="replies">
    <div class="tableBar" style="width:${uiReadyStats.replies.week.barWidth};">
        ${uiReadyStats.replies.week.val}
    </div>
    </td>
     <td class="reshares">
    <div class="tableBar" style="width:${uiReadyStats.reshares.week.barWidth};">
        ${uiReadyStats.reshares.week.val}
    </div>
    </td>
    <td class="shares">
    <div class="tableBar" style="width:${uiReadyStats.shares.week.barWidth};">
        ${uiReadyStats.shares.week.val}
    </div>
    </td>
  </tr>

   <tr class="month">
    <td>Month</td>
    <td class="reactions">
    <div class="tableBar" style="width:${uiReadyStats.reactions.month.barWidth};">
        ${uiReadyStats.reactions.month.val}
    </div>
    </td>
    <td class="comments">
    <div class="tableBar" style="width:${uiReadyStats.comments.month.barWidth};">
        ${uiReadyStats.comments.month.val}
    </div>
    </td>
    <td class="replies">
    <div class="tableBar" style="width:${uiReadyStats.replies.month.barWidth};">
        ${uiReadyStats.replies.month.val}
    </div>
    </td>
     <td class="reshares">
    <div class="tableBar" style="width:${uiReadyStats.reshares.month.barWidth};">
        ${uiReadyStats.reshares.month.val}
    </div>
    </td>
    <td class="shares">
    <div class="tableBar" style="width:${uiReadyStats.shares.month.barWidth};">
        ${uiReadyStats.shares.month.val}
    </div>
    </td>
  </tr>

  <tr class="quarter">
    <td>Quarter</td>
    <td class="reactions">
    <div class="tableBar" style="width:${uiReadyStats.reactions.quarter.barWidth};">
        ${uiReadyStats.reactions.quarter.val}
    </div>
    </td>
    <td class="comments">
    <div class="tableBar" style="width:${uiReadyStats.comments.quarter.barWidth};">
        ${uiReadyStats.comments.quarter.val}
    </div>
    </td>
    <td class="replies">
    <div class="tableBar" style="width:${uiReadyStats.replies.quarter.barWidth};">
        ${uiReadyStats.replies.quarter.val}
    </div>
    </td>
     <td class="reshares">
    <div class="tableBar" style="width:${uiReadyStats.reshares.quarter.barWidth};">
        ${uiReadyStats.reshares.quarter.val}
    </div>
    </td>
    <td class="shares">
    <div class="tableBar" style="width:${uiReadyStats.shares.quarter.barWidth};">
        ${uiReadyStats.shares.quarter.val}
    </div>
    </td>
  </tr>
  <tr class="year">
    <td>Year</td>
    <td class="reactions">
    <div class="tableBar" style="width:${uiReadyStats.reactions.year.barWidth};">
        ${uiReadyStats.reactions.year.val}
    </div>
    </td>
    <td class="comments">
    <div class="tableBar" style="width:${uiReadyStats.comments.year.barWidth};">
        ${uiReadyStats.comments.year.val}
    </div>
    </td>
    <td class="replies">
    <div class="tableBar" style="width:${uiReadyStats.replies.year.barWidth};">
        ${uiReadyStats.replies.year.val}
    </div>
    </td>
     <td class="reshares">
    <div class="tableBar" style="width:${uiReadyStats.reshares.year.barWidth};">
        ${uiReadyStats.reshares.year.val}
    </div>
    </td>
    <td class="shares">
    <div class="tableBar" style="width:${uiReadyStats.shares.year.barWidth};">
        ${uiReadyStats.shares.year.val}
    </div>
    </td>
  </tr>
`

    activityTable.appendChild(colStyling);
    activityTable.appendChild(headersRow);
    activityTable.appendChild(tbody);

    return activityTable;
}

function determineActivityLevel(stats, maxActivities, pctThreshold) {
    //Assumes that stats are cumulative,So the number for month includes the number for the week
    //This is subjective, but we need to assign activity levels
    //The output of this will be sent to StyleActivityLevel
    //We could have done everything in one function but i decided to keep them separate for readability

    let activityThreshold = pctThreshold * maxActivities;
    if (sumProps(stats, "week") > activityThreshold) {
        return 5;
    }
    if (sumProps(stats, "month") > activityThreshold) {
        return 4;
    }
    if (sumProps(stats, "quarter") > activityThreshold) {
        return 3;
    }
    if (sumProps(stats, "year") > activityThreshold) {
        return 2;
    }
    if (sumProps(stats, "year") < activityThreshold) {
        return 1;
    }

}

function extractActivityInfo(activityData) {

    //I do not know how to get the actual date a share was liked, only the date it was shared.
    //But I generally don't see posts in my feed more than a week old (tested on fake and real profile).
    //However, a one week range is ok. And a post must be shared before it is liked, so the share date is the maximum time since like. 
    //Remember our goal is just to understand how active someone is on LinkedIn.

    if (activityData.elements.length !== 0) {
        //Note: Shares & Reshares do not have Headers, but comments, reactions, replies to comments do.
        let comments = activityData.elements.reduce((filtered,i)=>{
            if (i.header) {
                if (i.header.text.text.match(/commented/g)) {
                    filtered.push({
                        content: i.header.text.text,
                        timeframe: i.actor.subDescription.accessibilityText
                    })
                }
            }
            ;return filtered
        }
        , []);

        //Note: We aren't actually getting the reaction date, but rather the orginal post date.
        //Articles don't have post dates, so we just put them in the year category
        //Example - https://www.linkedin.com/feed/update/urn:li:activity:6754492039687102464
        let reactions = activityData.elements.reduce((filtered,i)=>{
            if (i.header) {
                if (i.header.text.text.match(/like|celebrate|love|support|insightful|curious/g)) {
                    filtered.push({
                        content: i.header.text.text,
                        timeframe: (i.actor) ? i.actor.subDescription.accessibilityText : "10 months ago"
                    })
                }
            }
            ;return filtered
        }
        , []);

        let replies = activityData.elements.reduce((filtered,i)=>{
            if (i.header) {
                if (i.header.text.text.match(/replied/g)) {
                    filtered.push({
                        content: i.header.text.text,
                        timeframe: i.actor.subDescription.accessibilityText
                    })
                }
            }
            ;return filtered
        }
        , []);

        //Reshares can have new text, so if a share has the resharedUpdate, then it counts as a reshare
        let shares = activityData.elements.reduce((filtered,i)=>{
            if (!i.header && !i.resharedUpdate) {
                if (i.commentary || i.content) {
                    filtered.push({
                        item: i,
                        timeframe: i.actor.subDescription.accessibilityText
                    })

                }
            }
            ;return filtered
        }
        , []);

        let reshares = activityData.elements.reduce((filtered,i)=>{
            if (!i.header) {
                if (i.resharedUpdate) {
                    filtered.push({
                        item: i,
                        timeframe: i.actor.subDescription.accessibilityText
                    })
                }
            }
            ;return filtered
        }
        , []);

        let stats = {
            shares: getTimeframeCounts(shares),
            reshares: getTimeframeCounts(reshares),
            comments: getTimeframeCounts(comments),
            replies: getTimeframeCounts(replies),
            reactions: getTimeframeCounts(reactions),
        }

        if (sanityCheck_TotalEqualsSum(activityData.elements.length, stats)) {
            //console.log("Sanity check Passed!")
            return stats;

        } else {
            console.group()
            console.log("Failed Sanity Check")
            console.log(activityData);
            console.log(stats);
            console.groupEnd()
            return "Failed Sanity Check";
        }
    }
}

function getTimeframeCounts(items) {
    //Group by timeframe
    let week = items.filter(i=>i.timeframe.match(/hour|day/)).length;
    let month = items.filter(i=>i.timeframe.match(/week/)).length + week;
    let quarter = items.filter(i=>i.timeframe.match(/month/) && i.timeframe.match(/1|2|3/) && !i.timeframe.match(/[0-9]{2,}/g)).length + month;
    let year = items.filter(i=>i.timeframe.match(/month/)).length + month;

    return {
        week: week,
        month: month,
        quarter: quarter,
        year: year
    }

}

function preUImods() {
    try {
        //Wrapped with if so i don't have to reload the page in dev
        if (document.querySelector("#activityContainer") !== null) {
            let x = document.querySelector("#activityContainer");
            x.parentNode.removeChild(x)
        } else {

            //UI modifications need to be done every time we paginate
            //Give us some room on the side
            let dropRight = document.querySelector(".right-rail")
            dropRight.parentNode.removeChild(dropRight);

            //Add width to parent container
            let c = document.querySelector(".neptune-grid.two-column");
            c.classList.remove('two-column');
            c.classList.add('one-column');
        }
    } catch {
        console.log("preUImods exception handled")
    }

}

function sanityCheck_TotalEqualsSum(expected, stats) {
    if (expected !== 0) {

        let sum = 0;
        let x = flatten(stats);
        for (let[k,v] of Object.entries(x)) {
            if (k.match(/year/g)) {
                sum += v
            }
        }
        if (expected !== sum) {
            console.log("Not Equal -- Expected is: " + expected + " but Sum of components is:  " + sum);
            return false;
        }

    }
    return true;

}

function styleActivityLevel(activityLevel) {
    let activityLevelDiv = document.createElement('div');
    console.log(activityLevel);
    if (activityLevel === 5) {
        activityLevelDiv.innerText = "Very Active"
        activityLevelDiv.style = 'color:Green; font-size: 18px '
    }
    if (activityLevel === 4) {
        activityLevelDiv.innerText = "Active"
        activityLevelDiv.style = 'color:GreenYellow; font-size: 16px '
    }
    if (activityLevel === 3) {
        activityLevelDiv.innerText = "Somewhat Active"
        activityLevelDiv.style = 'color:Yellow; font-size: 14px '
    }
    if (activityLevel === 2) {
        activityLevelDiv.innerText = "Rarely Active"
        activityLevelDiv.style = 'color:Orange; font-size: 12px '
    }
    if (activityLevel === 1) {
        activityLevelDiv.innerText = "Not Active"
        activityLevelDiv.style = 'color:Red; font-size: 10px '
    }
    return activityLevelDiv;

}

function sumProps(obj, propName) {

    let flatObj = flatten(obj);
    let sum = 0;
    Object.keys(flatObj).forEach(key=>{
        if (key.split(".").pop() === propName) {
            sum += flatObj[key];
        }
    }
    );
    return sum;
}

function transformStatsForUi(stats, maxActivities) {
    //Add Logic to determine how/if to show timeframes that are irrelevant
    //For example if we only get 20 most recent activities, and they are all within the last week,
    //then month, quarter, year will only show 20, which is incorrect
    //So something like if timeframe (sum of all activity types) = maxActivities (the number REQUESTED from the api)
    //then do what? Ideas: write N/A for longer timneframes? Don't show longer timeframes?  

    let uiReadyStats = {};

    for (let dataType in stats) {
        uiReadyStats[dataType] = {};
        for (let timeframe in stats[dataType]) {
            uiReadyStats[dataType][timeframe] = {};
            uiReadyStats[dataType][timeframe].barWidth = Math.ceil((stats[dataType][timeframe] / maxActivities) * 100) + "%";
            uiReadyStats[dataType][timeframe].val = stats[dataType][timeframe];
        }

    }

    return uiReadyStats;
}

/******************************************************************************************************************/

/******************************************  Cookie API *********************************************************/
