let hashtags = ["ai","dna"];
(async()=>{
    let HTFollowerCounts = []
    await Promise.all(hashtags.map(async(tag) => HTFollowerCounts.push(await CallAPI(tag))));
    console.log(HTFollowerCounts);
}
)();

async function CallAPI(tag) {
    const res = await fetch("https://www.linkedin.com/voyager/api/feed/contentTopicData?keywords=" + tag + "&q=query", {
        "headers": {
            "csrf-token": "ajax:6198171114294898654"
        }
    })
    const data = await res.json();
     return {
        Hashtag: data.elements[0].entityUrn,
        Followers: data.elements[0].followAction.followingInfo.followerCount
    }
}
