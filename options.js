function setSettings() {
    var mins = document.getElementById("mininput").value;
    var safeList = getSelectValues(document.getElementById("categories"));

    UpdateTime(parseInt(mins) * 60 * 1000);
    updateList(safeList);
    var _background = chrome.extension.getBackgroundPage();
     _background.msToTime();
   // document.getElementById('time').innerHTML = _background.remTime;


}
document.getElementById("sav").addEventListener("click", setSettings);
function updateList(value) {
    chrome.storage.local.set({ list: value }, function () {
    });

}
function UpdateTime(value) {
    chrome.storage.local.set({ time: value }, function () {
    });
}

function getSelectValues(select) {
    var result = [];
    var options = select && select.options;
    var opt;

    for (var i = 0, iLen = options.length; i < iLen; i++) {
        opt = options[i];

        if (opt.selected) {
            result.push(opt.value || opt.text);
        }
    }
    return result;
}

//getSelectValues(document.getElementById("exampleFormControlSelect2"));
