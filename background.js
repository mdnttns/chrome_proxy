
var urlRegexp = /(?:.+:\/\/)([^\/]*)(?:\/.*)?/;

/////

chrome.browserAction.setBadgeBackgroundColor({color: [0, 120, 255, 255]});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.id == "save_options") {
            setProxy();
        }
    }
);

chrome.tabs.onActivated.addListener(function (tabInfo) {
    getCurrentTabHost((host) => {
        hostInList(host, (inList) => {
            setBadge(inList);
        });
    });
});

chrome.tabs.onUpdated.addListener(function (tabId , info) {
	getCurrentTabHost((host) => {
        hostInList(host, (inList) => {
            setBadge(inList);
        });
    });
});

chrome.browserAction.onClicked.addListener(function (tab) {
    getCurrentTabHost((host) => {
        addOrRemoveHost(host, (action) => {
            setBadge(action === "added");
            setProxy();
        })
    });
});

function setBadge(enabled) {
    chrome.browserAction.setBadgeText(enabled ? {text: " "} : {text: ""});
}

function setProxy() {
    getProxyConfig((config) => {
        chrome.proxy.settings.set({value: config, scope: 'regular'}, function () {});
    })
}

function getProxyConfig(callback) {
    var proxySettingsNames = ["proxy.scheme", "proxy.host", "proxy.port"];
    getSettings(proxySettingsNames, function (settings) {
        proxySettingsNames.forEach((name) => {
            if(!settings[name]) {
                throw "proxy setting: " + name + " not found";
            }
        });
        var config = {
            mode: "pac_script",
            pacScript: {}
        };
        var proxyType = "PROXY";
        if (settings["proxy.scheme"].indexOf("socks") !== -1) {
            proxyType = "SOCKS";
        }
        getSettings("hosts", function (items) {
            var hosts = items.hosts || [];
            var pacScript =
                "function FindProxyForURL(url, host) {\n" +
                "  if ([" + hosts.map((h) => { return "\"" + h + "\"" }).join(",") + "].indexOf(host) !== -1)\n" +
                "    return '" + proxyType + " " + settings["proxy.host"] + ":" + settings["proxy.port"] + "';\n" +
                "  return 'DIRECT';\n" +
                "}";
            config.pacScript.data = pacScript;
            callback(config);
        });
    })
}

function addOrRemoveHost(host, callback) {
    getSettings("hosts", (items) => {
        var hosts = items.hosts || [];
        var i = hosts.indexOf(host);
        if (i !== -1) {
            hosts.splice(i, 1);
        } else {
            hosts.push(host);
        }
        saveSettings({"hosts": hosts}, function() {
            callback(i !== -1 ? "removed" : "added");
        })
    })
}

function hostInList(host, callback) {
    getSettings("hosts", function(items) {
        var hosts = items.hosts || [];
        callback(hosts.indexOf(host) !== -1);
    });
}

function getSettings(names, callback) {
    chrome.storage.local.get(names, function (items) {
        callback(items);
    });
}

function saveSettings(keyValue, callback) {
    chrome.storage.local.set(keyValue, function () {
        console.log("saved to storage: " + JSON.stringify(keyValue));
        if (callback) {
            callback();
        }
    });
}

function getCurrentTabHost(callback) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        var url = tabs[0].url;
        callback(url.match(urlRegexp)[1]);
    });
}


////Context menu

const properties = {
    id: "proxy_context_menu",
    title: "Add or remove host from proxy list",
    contexts: ["link"]
};

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "proxy_context_menu") {
        var host = info.linkUrl.match(urlRegexp)[1];
        var pageHost = info.pageUrl.match(urlRegexp)[1];
        addOrRemoveHost(host, (action) => {
            setProxy();
            if (host === pageHost) {
                setBadge(action === "added")
            }
        });
    }
});

chrome.contextMenus.create(properties, function () {});