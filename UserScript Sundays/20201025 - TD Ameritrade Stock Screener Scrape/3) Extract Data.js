//Fetch  
fetch("https://research.ameritrade.com/grid/wwws/screener/stocks/results.asp?section=stocks&params=B64ENCeyJzY3JlZW5OYW1lIjoiQ3VzdG9tIFNjcmVlbiIsImZpcnN0IjoyMDAsInJvd3MiOjEwMCwidmlldyI6IlZvbHVtZSIsInNvcnRmaWVsZCI6InRpY2tlciIsInNvcnRkaXIiOiJBIn0%3D&display=popup&c_name=invest_VENDOR", {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9,de;q=0.8",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
    },
    "referrer": "https://research.ameritrade.com/grid/wwws/screener/stocks/results.asp?section=stocks&params=B64ENCeyJzY3JlZW5OYW1lIjoiQ3VzdG9tIFNjcmVlbiIsImZpcnN0IjoxMDAsInJvd3MiOjEwMCwidmlldyI6IlZvbHVtZSIsInNvcnRmaWVsZCI6InRpY2tlciIsInNvcnRkaXIiOiJBIn0%3D&display=popup&c_name=invest_VENDOR",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
}).then((res)=>res.text()).then((html)=>{

    let parser = new DOMParser();
    let doc = parser.parseFromString(html, "text/html");
    let jsAll = document.getElementsByTagName("script");
    let js = Array.from(jsAll).filter((i)=>(i.innerHTML.includes('Screener.setResultsData(')))[0].innerHTML;
    let obj = JSON.parse(js.slice(js.indexOf('{'), js.lastIndexOf('}') + 1))
    let stocks = obj.data;
    console.log(stocks)
    }
);


//If you want specific columns, you need to do this for each specific view (Because different views return different data)
//I abandoned this because it's not worth the effort, just hide/ignore/delete the unwanted columns when you import it the analysis tool.

//     let selectedInfo = stocks.map((s)=>{
//         return {
//             CompanyName: s.CompanyName,
//             Debt2CapitalMRQ: s.Debt2CapitalMRQ,
//             EPSGrowthHistLast4Q: s.EPSGrowthHistLast4Q,
//             GICSIndustry: s.GICSIndustry,
//             GICSSector: s.GICSSector,
//             GICSSubIndustry: s.GICSSubIndustry,
//             LastTradeTime: s.LastTradeTime,
//             LastTradeTime_format: s.LastTradeTime_format,
//             PEHistTTM: s.PEHistTTM_format,
//             Price2CF: s.Price2CF_format,
//             Price2Sales: s.Price2Sales_format,
//             Price52wHigh: s.Price52wHigh,
//             Price52wLow: s.Price52wLow,
//             PriceChangeLast4W: s.PriceChangeLast4W,
//             PriceChangeLast13W: s.PriceChangeLast13W,
//             PriceChangeLast26W: s.PriceChangeLast26W,
//             PriceChangeLast52W: s.PriceChangeLast52W,
            
//         }

//     }
//     )
//     console.log(selectedInfo)

