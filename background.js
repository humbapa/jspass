chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    currenturl = tab.url.toLowerCase();
    currenthostname = currenturl.match(/\/([^\/:]+)/)[1];
    currenthostnamepieces = currenthostname.split(".");
    currentdomainname = currenthostnamepieces[currenthostnamepieces.length - 2]
        + "."
        + currenthostnamepieces[currenthostnamepieces.length - 1];

    /*
    mydomains = [];
    mydomainstext = window.localStorage.mydomains;
    if (mydomainstext != "") {
        mydomainstextpieces = mydomainstext.split(",");
        for (i=0; i < mydomainstextpieces.length; i++) {
            mydomains[i] = $.trim(mydomainstextpieces[i]);
        }
    }
    if (mydomains.length > 0
        && currenthostnamepieces.length > 2
        && $.inArray(currentdomainname, mydomains) != -1) {

        currentdomainname = currenthostnamepieces[currenthostnamepieces.length - 3]
            + "."
            + currentdomainname;
    }
    */
    
    chrome.storage.sync.get(currentdomainname, function(items) {
        if (items[currentdomainname]) {
            chrome.browserAction.setIcon({path: "icon_active19.png"});
        } else {
            chrome.browserAction.setIcon({path: "icon19.png"});
        }
    });
});