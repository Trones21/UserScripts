let posts = Array.from(document.querySelectorAll('.occludable-update'))
let newPosts = posts.filter((i) => i.querySelector('.icon-and-text-container'))

let data = newPosts.map((i) => {return{
    PostId: i.firstElementChild.getAttribute("data-urn").split(":")[3],
    whenPosted: i.querySelector('.feed-shared-actor__sub-description > span > .visually-hidden').innerText,
    Views: i.querySelector('.icon-and-text-container > span > strong').innerText.replace(",","").trim().split(" ")[0],
    Text: (i.querySelector('.feed-shared-update-v2__description-wrapper')) !== null ?
    i.querySelector('.feed-shared-update-v2__description-wrapper').innerText : null
}})

let initialObject = data;
//To Create a CSV

let headersStr = getCSVstring_PropNamesAsHeaders(initialObject,",");

//Remove delimiter and newlines from string properties
let cleanData = regexReplaceinProps(initialObject, /,|\r\n|\r|\n/g, " ")

let recordsStr = ConvertToCSV(cleanData, ",");
writeCSV(headersStr + recordsStr , "MyFeed");

function ConvertToCSV(objArray, delimiter) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '')

                line += delimiter

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function writeCSV(cleanData, fileNameNoExt) {

    let data = new Blob([cleanData],{
        type: "text/csv;charset=utf-8"
    });
    let url = window.URL.createObjectURL(data);

    let dLink = document.createElement("a");
    dLink.setAttribute("href", url);
    dLink.download = fileNameNoExt + ".csv";
    dLink.click();
}


function getCSVstring_PropNamesAsHeaders(objArray, delimiter){
    let headersObj = {};
    headersObj.str = "";
    for(let field in objArray[0]){
        headersObj.str = headersObj.str + field + delimiter  
    }
    return headersObj.str + '\r\n';
}

function regexReplaceinProps(objArr, expression, replacement){
    let regex = new RegExp(expression, "g")
    for (let obj of objArr) {
        for (let key in obj) {
            if (typeof obj[key] == "string") {
                obj[key] = obj[key].replace(regex, replacement);
            }
        }
    }
    return objArr;

}
