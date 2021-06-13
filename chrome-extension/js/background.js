const extpay = ExtPay('carden');
var session_active = true;
var session_cards = 0;
var level = 0;
var points = 0;
var streak = 0;
var correct = 0;
var incorrect = 0;
var forgotten = 0;
var total_cards = 0;
var currentdeck = 0;

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.get(['auth_token'], function(result) {
        if (typeof result === "undefined" || Object.keys(result).length === 0) {
            session_active = false;
        } else {
            chrome.storage.sync.set({
                deck: currentdeck
            });
            getCards(result);
        }
    });
    chrome.storage.sync.set({
        loaded: false,
        total_cards: 0,
        premium: false,
        alert: true,
        points: 0
    });
});

// When user upgrades to premium
extpay.onPaid.addListener(user => {
    chrome.storage.sync.set({
        premium: true
    });
})

var now = new Date();
var timeleft = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0) - now;
if (timeleft < 0) {
    timeleft += 86400000; // it's after 10am, try 10am tomorrow.
}
checkSession();

// Check if a new session is available (at midnight every day)
function checkSession() {
    setTimeout(function() {
        var timeleft = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0) - now;
        if (timeleft < 0) {
            timeleft += 86400000;
        }
        chrome.storage.sync.get(['auth_token'], function(result) {
            if (typeof result === "undefined" || Object.keys(result).length === 0) {
                session_active = false;
            } else {
                getCards(result);
                getLevel(result);
            }
        });
    }, timeleft);
}

// Get cards for session
function getCards(result, response, sendResponse) {
    var xhttp = new XMLHttpRequest();
    var params = 'auth_id=' + result.auth_token + '&deck=' + currentdeck;
    xhttp.open("POST", "../../server/get_cards.php", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            if (xhttp.responseText != 0) {
                var qanda = JSON.parse(xhttp.responseText);
                session_cards = qanda.length;
                session_active = true;
                showAlert();
                if (response) {
                    sendResponse({
                        status: session_active,
                        cards: session_cards
                    });
                }
            } else {
                session_active = false;
                hideAlert();
                if (response) {
                    sendResponse({
                        status: session_active,
                        cards: session_cards
                    });
                }
            }
        }
    };
    xhttp.send(params);
}

// Get current user stats
function getLevel(result) {
    var xhttp = new XMLHttpRequest();
    var params = 'auth_id=' + result.auth_token;
    xhttp.open("POST", "../../server/get_level.php", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            level = JSON.parse(xhttp.responseText)[0];
            points = JSON.parse(xhttp.responseText)[1];
            streak = JSON.parse(xhttp.responseText)[2];
            total_cards = JSON.parse(xhttp.responseText)[3];
            chrome.storage.sync.set({
                total_cards: total_cards
            });
            correct = JSON.parse(xhttp.responseText)[4];
            incorrect = JSON.parse(xhttp.responseText)[5];
            forgotten = JSON.parse(xhttp.responseText)[6];
            return;
        }
    };
    xhttp.send(params);
}

// Shows an alert on the extension icon
function showAlert() {
    chrome.storage.sync.get(['alert'], function(result) {
        if (result.alert) {
            chrome.browserAction.setIcon({
                path: {
                    "16": "../assets/extension-icons/logo-16-alert.png",
                    "32": "../assets/extension-icons/logo-32-alert.png",
                    "48": "../assets/extension-icons/logo-32-alert.png"
                }
            });

        } else {
            hideAlert();
        }
    });
}

// Default extension icon
function hideAlert() {
    chrome.browserAction.setIcon({
        path: {
            "16": "../assets/extension-icons/logo-16.png",
            "32": "../assets/extension-icons/logo-32.png",
            "48": "../assets/extension-icons/logo-32.png"
        }
    });
}

function createCardFront(info, tab) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: "new-context-card",
            selection: info.selectionText,
            side: "front"
        });
    });
}

function createCardBack(info, tab) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: "new-context-card",
            selection: info.selectionText,
            side: "back"
        });
    });
}

// Context menu
chrome.contextMenus.create({
    title: "Create a flashcard for \"%s\"",
    contexts: ["selection"],
    id: "NEW_CARD",
});

chrome.contextMenus.create({
    title: "Create question from selection",
    contexts: ["selection"],
    parentId: "NEW_CARD",
    onclick: createCardFront
});

chrome.contextMenus.create({
    title: "Create answer from selection",
    contexts: ["selection"],
    parentId: "NEW_CARD",
    onclick: createCardBack
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "startup") {
        chrome.storage.sync.get(['auth_token'], function(result) {
            if (typeof result === "undefined" || Object.keys(result).length === 0) {
                session_active = false;
            } else {
                getCards(result, true, sendResponse);
            }
        });
        return true;
    } else if (request.type == "deck") {
        sendResponse({
            deck: currentdeck
        });
    } else if (request.type == "set-deck") {
        currentdeck = request.deck;
    } else if (request.type == "end-session") {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "end-session"
            });
        })
    } else if (request.type == "hide-alert") {
        hideAlert();
    } else if (request.type == "show-alert") {
        showAlert();
    } else if (request.type == "check-premium") {
        extpay.getUser().then(user => {
            if (user.paid) {
                chrome.storage.sync.set({
                    premium: true
                });
            } else {
                chrome.storage.sync.set({
                    premium: false
                });
            }
        })
    } else if (request.type == "open-premium") {
        extpay.openPaymentPage()
    } else if (request.type == "manage-premium") {
        extpay.openPaymentPage()
    }
});