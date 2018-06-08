
var re = /(?:.+:\/\/)([^\/]*)(?:\/.*)?/;

chrome.tabs.onActivated.addListener(function (tabInfo) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        var url = tabs[0].url;
        console.log(url.match(re)[1]);
    });
});

chrome.browserAction.onClicked.addListener(function (tab) {

    chrome.browserAction.setBadgeBackgroundColor({color: [0, 220, 0, 255]});
    chrome.browserAction.getBadgeText({}, (value) => {
        // chrome.proxy.settings.set({value: getProxyConfig(!!value), scope: 'regular'}, function () {});
        // chrome.browserAction.setBadgeText(value ? {text: ""} : {text: " "});
    })

});

function getProxyConfig(proxyDisabled, callback) {
    if (proxyDisabled) {
        return {mode:"direct"}
    }
    var proxySettingsNames = ["proxy.scheme", "proxy.host", "proxy.port"];
    getSettings(proxySettingsNames, function (settings) {
        proxySettingsNames.forEach((name) => {
            if(!settings[name]) {
                throw "proxy setting: " + name + " not found";
            }
        });
        var config = {
            mode: "fixed_servers",
            rules: {
                fallbackProxy: {
                    scheme: settings["proxy.scheme"],
                    host: settings["proxy.host"],
                    port: settings["proxy.port"]
                    // scheme: "socks5",
                    // host: "192.168.56.1",
                    // port: 9150
                }
            }
        };
        callback(config);
    })
}

function getSettings(names, callback) {
    chrome.storage.local.get(/* String or Array */names, function (items) {
        callback(items);
    });
}

function saveSettings(values, callback) {
    
}

