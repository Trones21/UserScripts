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


//Create scaffold for data
let activityContainer = document.createElement('div');
activityContainer.innerText = "Very Active, Not Active, etc.";

let mockdata = {
    reactions:{
    day: 0,
    week: 5,
    month: 27,  
    },
    comments:{
    day: 0,
    week: 2,
    month: 12,
}}


let activityTable = document.createElement('table');

let colStyling = document.createElement('colgroup')
colStyling.innerHTML =`
<col span='1' style="background-color:yellow">

`

let headersRow = document.createElement('tr');
headersRow.InnerHTML = `
  <th></th>
  <th>Reactions</th>
  <th>Comments</th>
  <th>Replies</th>
  <th>ReShares</th>
  <th>Shares</th>
`



let tbody = document.createElement('tbody');
tbody.innerHTML =`
 <tr>
    <td>Day</td>
    <td></td>
    <td></td>
  </tr>
   <tr>
    <td>Week</td>
    <td></td>
    <td></td>
  </tr>
     <tr>
    <td>Month</td>
    <td></td>
    <td></td>
  </tr>
     <tr>
    <td>Quarter</td>
    <td></td>
    <td></td>
  </tr>
`

activityTable.appendChild(colStyling);
activityTable.appendChild(headersRow);
activityTable.appendChild(tbody);

activityContainer.appendChild(activityTable);

//Add Scaffold
entity.insertBefore(activityContainer, entity.children[2]);


