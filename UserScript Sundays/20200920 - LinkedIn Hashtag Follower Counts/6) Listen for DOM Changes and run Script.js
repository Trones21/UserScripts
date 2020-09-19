let textbox = document.querySelector('.ql-editor');

// Options for the observer (which mutations to observe)
let config = {
    attributes: true,
    childList: true,
    subtree: true
};

// Callback function to execute when mutations are observed
let callback = function(mutationsList, observer) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'attributes') {
            setTimeout(Main, 500);
        }
    }
};

// Create an observer instance linked to the callback function
let observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(textbox, config);

function Main() {
    if (document.querySelectorAll(".search-typeahead-v2__hit-text").length !== 0) {
        let hashtagDivs = document.querySelectorAll(".search-typeahead-v2__hit-text")
        //Get hashtag text And CallAPI for followerCount
        let hashtags = Array.from(document.querySelectorAll(".search-typeahead-v2__hit-text")).map((i)=>i.innerText.replace("#", ""));
        (async()=>{
            let HashtagsPlus = []
            await Promise.all(hashtags.map(async(tag)=>HashtagsPlus.push(await CallAPI(tag))));

            for(let tag of HashtagsPlus){
                for (let hashtagdiv of hashtagDivs){
                    if(hashtagdiv.innerText === "#" + tag.Text){
                       let followerDiv = document.createElement("div");
                       followerDiv.style = "color:#0073b1; font-weight:bold; position:absolute; right: 10px;"
                       followerDiv.innerText = tag.Followers;
                       hashtagdiv.parentElement.parentElement.append(followerDiv);
                    }
                }  
               
            }
        }
        )();
    }
}

async function CallAPI(tag) {
    const res = await fetch("https://www.linkedin.com/voyager/api/feed/contentTopicData?keywords=" + tag + "&q=query", {
        "headers": {
            "csrf-token": "ajax:6198171114294898654"
        }
    })
    const data = await res.json();
    return {
        Text: data.elements[0].entityUrn.split(":")[6],
        Followers: data.elements[0].followAction.followingInfo.followerCount
    }
}
