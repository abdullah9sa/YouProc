var _background = chrome.extension.getBackgroundPage();

document.getElementById('time').innerHTML = _background.remTime;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.msg === "time_changed") {
            if (request.data.dis <= 0) {
                document.getElementById('time').innerHTML = "Time Is Over";//request.data.tim;
            } else {
                document.getElementById('time').innerHTML = request.data.tim;
            }
        }
    }
);

document.getElementById("opt").addEventListener("click", newPage);
function newPage(){
    window.open("options.html", '_blank');
}