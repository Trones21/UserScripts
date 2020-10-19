//Need to Run Synchronously and use the next page link (from the response)
(async() => {
let headers = {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9,de;q=0.8",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
    },
    "referrer": "https://research.ameritrade.com/grid",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
}

//Pre run checks
if(document.querySelectorAll('select')[3].selectedOptions[0].label !== "100"){
    console.log("Please select 100 results per page")
    return 0;
}

//Number of requests
let reqCount = Math.ceil(Number(document.querySelector('.resultsHeading > span').innerText.split(" ")[0].replace(",", ""))/100);

//Will start Scraping with the page you are on 
let nextFetchstr = location.href

let allStocks = [];
for(x = 1; x <= reqCount; x++){
    let res = await fetch(nextFetchstr, headers)
    let html = await res.text();
    let parser = new DOMParser();
    let doc = await parser.parseFromString(html, "text/html");
    nextFetchstr = await Array.from(doc.querySelectorAll('.fright.margLeft15')[0].children)[11].href;
    console.log(nextFetchstr)
    allStocks.push(await parseStockData(doc))
}
console.log(allStocks.flat())


function parseStockData(doc){

    let jsAll = doc.getElementsByTagName("script");
    let js = Array.from(jsAll).filter((i)=>(i.innerHTML.includes('Screener.setResultsData(')))[0].innerHTML;
    let obj = JSON.parse(js.slice(js.indexOf('{'), js.lastIndexOf('}') + 1))
    let stocks = obj.data;
    //console.log(stocks)
    return stocks
}    

})()