//Mock data 
let maxActivities = 50;
let stats = {
    reactions: {
        week: 5,
        month: 27,
        quarter: 31,
        year: 43
    },
    comments: {
        week: 1,
        month: 7,
        quarter: 14,
        year: 25
    },
    replies: {
        week: 0,
        month: 4,
        quarter: 6,
        year: 18
    },
    reshares: {
        week: 0,
        month: 5,
        quarter: 14,
        year: 21
    },
    shares: {
        week: 2,
        month: 7,
        quarter: 9,
        year: 14
    }

}

//UI modifications need to be done every time we paginate
//Give us some room on the side
let dropRight = document.querySelector(".right-rail")
dropRight.parentNode.removeChild(dropRight);

//Add width to parent container
let c = document.querySelector(".neptune-grid.two-column");
c.classList.remove('two-column');
c.classList.add('one-column');

//Example - Will Need to do this for all rows
let entity = document.querySelector(".entity-result__item");
entity.style.maxWidth = "none";
entity.children[1].style.maxWidth = "40%";

//Create Container for My Content
let activityContainer = document.createElement('div');

//DetermineActivityLevel
let activityLevel = document.createElement('div');
activityLevel.innerHTML = "Implement Later"//styleActivityLevel(determineActivityLevel());
activityContainer.appendChild(activityLevel);

//Create Table
let uiReadyStats = transformStatsForUi(stats, maxActivities);
let activityTable = buildTable(uiReadyStats)
activityContainer.appendChild(activityTable);

//Insert container before the Connect/Message Button
entity.insertBefore(activityContainer, entity.children[2]);



/*************Supporting Functions*******************/


function determineActivityLevel(){

}

function styleActivityLevel(){

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
            uiReadyStats[dataType][timeframe].barWidth = Math.ceil((stats[dataType][timeframe] / maxActivities)*100) + "%";
            uiReadyStats[dataType][timeframe].val = stats[dataType][timeframe];
        }

    }

    return uiReadyStats;
}


function buildTable(uiReadyStats) {
    let activityTable = document.createElement('table');

    let colStyling = document.createElement('colgroup')
    colStyling.innerHTML = `
<col span='1' style="background-color:yellow">

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
    <div style="width:${uiReadyStats.reactions.week.barWidth}; background-color:#0084bf;">
        ${uiReadyStats.reactions.week.val}
    </div>
    </td>
    <td class="comments">
    <div style="width:${uiReadyStats.comments.week.barWidth}; background-color:#0084bf;">
        ${uiReadyStats.comments.week.val}
    </div>
    </td>
    <td class="replies">${uiReadyStats.replies.week.val}</td>
    <td class="reshares">${uiReadyStats.reshares.week.val}</td>
    <td class="shares">${uiReadyStats.shares.week.val}</td>
  </tr>
  <tr class="month">
    <td>Month</td>
    <td class="reactions">
        <div style="width:${uiReadyStats.reactions.month.barWidth}; background-color:#0084bf;">
        ${uiReadyStats.reactions.month.val}
        </div>
    </td>
    <td class="comments">${uiReadyStats.comments.month.val}</td>
    <td class="replies">${uiReadyStats.replies.month.val}</td>
    <td class="reshares">${uiReadyStats.reshares.month.val}</td>
    <td class="shares">${uiReadyStats.shares.month.val}</td>
  </tr>
  <tr class="quarter">
    <td>Quarter</td>
    <td class="reactions">${uiReadyStats.reactions.quarter.val}</td>
    <td class="comments">${uiReadyStats.comments.quarter.val}</td>
    <td class="replies">${uiReadyStats.replies.quarter.val}</td>
    <td class="reshares">${uiReadyStats.reshares.quarter.val}</td>
    <td class="shares">${uiReadyStats.shares.quarter.val}</td>
  </tr>
  <tr class="year">
    <td>Year</td>
    <td class="reactions">${uiReadyStats.reactions.year.val}</td>
    <td class="comments">${uiReadyStats.comments.year.val}</td>
    <td class="replies">${uiReadyStats.replies.year.val}</td>
    <td class="reshares">${uiReadyStats.reshares.year.val}</td>
    <td class="shares">${uiReadyStats.shares.year.val}</td>
  </tr>
`

    activityTable.appendChild(colStyling);
    activityTable.appendChild(headersRow);
    activityTable.appendChild(tbody);

    return activityTable;
}
