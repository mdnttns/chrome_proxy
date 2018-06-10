var options = [
    {
        name: "proxy.host"
    }, {
        name: "proxy.port"
    }, {
        name: "proxy.scheme"
    }
];

function init() {
    options.forEach(o => {
        o.el = document.getElementById(o.name);
    })
    restore_options();

    document.getElementById('save').addEventListener('click', save_options);
}

function restore_options() {
    chrome.storage.local.get(options.map((o) => o.name), function (items) {
        options.forEach(o => {
            var value = items[o.name];
            if (value !== undefined) {
                o.el.value = value;
            }
        })
    });
}

function save_options() {
    var optionsToSave = {};
    options.forEach(o => {
        optionsToSave[o.name] = o.el.value;
    });
    chrome.storage.local.set(optionsToSave, function () {
        sendMessage({id: "save_options"});
    });
}

function sendMessage(msg) {
    chrome.runtime.sendMessage(msg, function (response) {});
}

document.addEventListener('DOMContentLoaded', init);