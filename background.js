var remTime;
msToTime();
//var timeIsOver = false;

function setTimeIsOver(value) {
  chrome.storage.local.set({ over: value }, function () {
  });
}

function timeIsOver() {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(['over'], function (result) {
      resolve(result.over);
    })
  });
}


async function msToTime() {
  var s;
  s = await getTimeRem();
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  if (hrs == 0 || hrs == null || hrs == undefined || hrs == "")
    remTime = mins + ':' + secs;
  else
    remTime = hrs + ':' + mins + ':' + secs;
  return hrs + ':' + mins + ':' + secs;
}



function UpdateTime(value) {
  chrome.storage.local.set({ time: value }, function () {
    console.log('time is set to ' + value);
    msToTime();
  });
}

async function DayChange() {
  var d = new Date();
  if (d.getDate() != await GetDay()) {
    dayVal = d.getDate();
    chrome.storage.local.set({ day: dayVal }, function () {
      //UpdateTime(1000 * 60 * 10);
     // checkSettings();
      setTimeIsOver(false)
      //timeIsOver = false;
      Count();
    });
  } else {
    Count();
  }
}


function GetDay() {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(['day'], function (result) {
      resolve(result.day);
    })
  });
}

function getTimeRem() {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(['time'], function (result) {
      resolve(result.time);
    })
  });
}


async function Count(cond) {
  console.log("Called");
  var now = new Date().getTime();
  var daysTime = now + await getTimeRem();//(1000 * 60 *10);
  var x = setInterval(function () {
    if (stop) {
      clearInterval(x);
    }
    var now = new Date().getTime();
    var distance = daysTime - now;

    if (distance < 0) {
      clearInterval(x);
      setTimeIsOver(true)
   //   timeIsOver = true;
      stop = true;
      init();
      chrome.runtime.sendMessage({
        msg: "time_changed",
        data: {
          tim: remTime,
          dis: distance
        }
      });
      return;
    }

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    UpdateTime(distance);
    console.log(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");
    remTime = hours + "h " + minutes + "m " + seconds + "s ";

    chrome.runtime.sendMessage({
      msg: "time_changed",
      data: {
        tim: remTime,
        dis: distance
      }
    });
  }, 1000);
}
function init(tab) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] == undefined) {
      return;
    }
    var activeTab = tabs[0];
    var videoURL = activeTab.url;
    var videoID;

    if (videoURL.includes("youtube") && videoURL.includes("v=")) {
      stop = false;
      videoID = getParams(videoURL);
      execute(videoID);
    } else {
      stop = true;
      //Count();
    }
  });
}

chrome.tabs.onUpdated.addListener(function callback() {
  stop = true;
  init();
});
chrome.tabs.onActivated.addListener(function callback() {
  stop = true;
  init();
});

chrome.windows.onFocusChanged.addListener(function callback() {
  chrome.windows.getCurrent(function callback(w) {
    if (!w['focused']) {
      stop = true;
      init();

    } else {
      stop = true;
      init();
    }
  })
});

//get video ID
var getParams = function (url) {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params['v'];
};

function execute(videoID) {
  apiKey = "AIzaSyCCu_3eEfGHziqvabevc3oXsKRA_JYoaEo";
  const Http = new XMLHttpRequest();
  const url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoID + "&key=" + apiKey;
  Http.open("GET", url);
  Http.send();
  Http.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      checkCategory(Http.responseText.toString());
    }
  };
}

function getSafeList(){
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(['list'], function (result) {
      resolve(result.list);
    })
  });
}
checkSettings();
async function checkSettings()
{
  var a = await getSafeList();
  var b = await getTimeRem();

  if(a == undefined)
  {
        chrome.storage.local.set({ list: ["28","35","27"] }, function () {
    });
  }
  if(b == undefined)
  {
    UpdateTime(15 * 60 *1000);
  }
}

async function checkCategory(resp) {
  var responseJson = JSON.parse(resp);
  //var categoryID = responseJson["items"][0]["snippet"]["categoryId"];
  var categoryID = responseJson["items"][0]["snippet"]["categoryId"];
  checkSettings();
  var safeList = await getSafeList();//["27"];
  if (safeList.includes(categoryID)) {
  }
  else {
    if (await timeIsOver()) {
      chrome.tabs.query({ active: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL("/block.html") });
      });
      return;
    }
    DayChange();
  }
}
