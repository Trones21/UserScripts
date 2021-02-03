console.log("Connections Value script running")
asyncMain();

//Tested up to 100 -- Only uses 1 request 
let ActivitiesToGet = 50;

async function asyncMain() {

    let divs = Array.from(document.querySelectorAll('.entity-result__title-text > a'));
    //Sometimes the script loads too quickly -- not the ideal solution, but it works
    if (divs.length !== 10) {
        await sleep(2000)
        divs = Array.from(document.querySelectorAll('.entity-result__title-text > a'));
    }

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

        const netRes = await fetch("https://www.linkedin.com/voyager/api/identity/profiles/" + ID + "/networkinfo", headers);
        const networkInfoData = await (netRes.json());
        let networkinfo = document.createElement("div");

        networkinfo.innerText = "Followers: " + networkInfoData.followersCount;

        //profileUrn formatted like this - urn%3Ali%3Afsd_profile%3AACoAAAzFhwEBug9lp9mZersl336pfd_p0uWTRQs
        const profileUrnClean = networkInfoData.entityUrn.split(':')[3];
        const profileUrn = "urn%3Ali%3Afsd_profile%3A" + profileUrnClean;

        const actRes = await fetch("https://www.linkedin.com/voyager/api/identity/profileUpdatesV2?count=" + ActivitiesToGet + "&includeLongTermHistory=true&moduleKey=member-activity%3Aphone&profileUrn=" + profileUrn + "&q=memberFeed&start=0", headers);
        const activityData = await (actRes.json());
        let activityInfo = extractActivityInfo(activityData);

        console.log(activityInfo);
        
        let activityDiv = document.createElement('div');

        let container = document.createElement('div');
        container.appendChild(activityDiv);
        container.appendChild(networkinfo);

        let parentEl = document.querySelector('.entity-result__title-text > a[href="https://www.linkedin.com/in/' + ID + '"]').parentElement;
        parentEl.appendChild(container)

    }
    ))

}

function sleep(time) {
    return new Promise((resolve)=>setTimeout(resolve, time));
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

function OLDactivityStyle(activityCount) {
    if (activityCount === 0) {
        return "color:red; font-weight:600;"
    } else if (activityCount === 6) {
        return "color:green; font-weight:600;"
    } else {
        return ""
    }
}
