//Array.from(document.querySelectorAll(".search-typeahead-v2__hit-text ")).map((i)=> i.innerText.replace("#", ""))
(async () => {
const hashtags = ["ai", "biotech", "dna"];
let HTFollowerCounts = []
await Promise.all(
    hashtags.map(async (tag) =>{
          const res = await fetch("https://www.linkedin.com/voyager/api/feed/contentTopicData?keywords="+tag+"&q=query", {
            "headers": {"csrf-token": "ajax:6198171114294898654"}})
          const data = await res.json();
          HTFollowerCounts.push({
              Hashtag: data.elements[0].entityUrn, 
              Followers: data.elements[0].followAction.followingInfo.followerCount
              })
    })
    );
console.log(HTFollowerCounts);

})();
