



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
        week: 3,
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

try{
//Wrapped with if so i don't have to reload the page in dev
if(document.querySelector("#activityContainer") !== null){
   let x = document.querySelector("#activityContainer");
   x.parentNode.removeChild(x)
} else{

//UI modifications need to be done every time we paginate
//Give us some room on the side
let dropRight = document.querySelector(".right-rail")
dropRight.parentNode.removeChild(dropRight);

//Add width to parent container
let c = document.querySelector(".neptune-grid.two-column");
c.classList.remove('two-column');
c.classList.add('one-column');
}

//Example - Will Need to do this for all rows
let entity = document.querySelector(".entity-result__item");
entity.style.maxWidth = "none";
entity.children[1].style.maxWidth = "40%";
}catch{}

let entity = document.querySelector(".entity-result__item");

//Create Container for My Content
let activityContainer = document.createElement('div');
activityContainer.id = "activityContainer";
activityContainer.style = 'background-color:DarkGray'

//DetermineActivityLevel
let activityLevelDiv = styleActivityLevel(determineActivityLevel(stats, maxActivities, 0.9));
activityContainer.appendChild(activityLevelDiv);

//Create Table
let uiReadyStats = transformStatsForUi(stats, maxActivities);
let activityTable = buildTable(uiReadyStats)
activityContainer.appendChild(activityTable);

//Insert container before the Connect/Message Button
entity.insertBefore(activityContainer, entity.children[2]);

/*************Supporting Functions*******************/

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

function buildTable(uiReadyStats) {
    let activityTable = document.createElement('table');
    activityTable.style= 'border-collapse: separate; border-spacing:8px 1px'

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
