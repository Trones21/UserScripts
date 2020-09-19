fetch("https://www.linkedin.com/voyager/api/feed/contentTopicData?keywords=biotech&q=query", {
  "headers": {"csrf-token": "ajax:6198171114294898654"}

}).then((res)=> res.json()).then((data) => {
  console.log(data.elements[0].followAction.followingInfo.followerCount);  
  console.log(data)
});