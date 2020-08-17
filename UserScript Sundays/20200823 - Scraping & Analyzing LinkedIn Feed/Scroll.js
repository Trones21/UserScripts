setIntervalX(scroll, 3000, 30)

function setIntervalX(callback, delay, repetitions) {
    let i = 0;
    let intervalID = window.setInterval(function() {
        callback(i);
        console.log(i);
        i += 1

        if (i > repetitions) {
            window.clearInterval(intervalID);
        }
    }, delay);
}

function scroll() {
    window.scrollTo(0, document.body.scrollHeight);
}
///