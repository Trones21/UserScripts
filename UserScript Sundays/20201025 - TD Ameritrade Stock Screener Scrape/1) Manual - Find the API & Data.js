//API in Doc Network Tab

//Copy Script on Line 270 

//Parse in console 

//Fetch  
fetch("https://research.ameritrade.com/grid/wwws/screener/stocks/results.asp?section=stocks&params=B64ENCeyJzY3JlZW5OYW1lIjoiQ3VzdG9tIFNjcmVlbiIsImZpcnN0IjozMDAsInJvd3MiOjEwMCwidmlldyI6IlZhbHVhdGlvbiIsInNvcnRmaWVsZCI6InRpY2tlciIsInNvcnRkaXIiOiJBIn0%3D&display=popup&c_name=invest_VENDOR", {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "en-US,en;q=0.9,de;q=0.8",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  },
  "referrer": "https://research.ameritrade.com/grid/wwws/screener/stocks/results.asp?section=stocks&params=B64ENCeyJzY3JlZW5OYW1lIjoiQ3VzdG9tIFNjcmVlbiIsImZpcnN0IjoyMDAsInJvd3MiOjEwMCwidmlldyI6IlZhbHVhdGlvbiIsInNvcnRmaWVsZCI6InRpY2tlciIsInNvcnRkaXIiOiJBIn0%3D&display=popup&c_name=invest_VENDOR",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
}).then((res) => res.text()).then((html) => console.log(html)); 