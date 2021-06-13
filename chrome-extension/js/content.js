$(document).ready(function() {
    var selection;
    var side;

    // Creates a new session on the current tab
    function newSession() {
        $("body").prepend("<iframe id='flashcard-extension' style='all: initial;height: 100%;width: 100%;position: fixed;top: 0px;left: 0px;z-index: 9999999999!important;margin: 0px!important;padding: 0px!important;border: 0px!important;' src='" + chrome.runtime.getURL('../html/overlay.html') + "'></iframe>");
    }

    function newCard() {
        $("body").prepend("<iframe id='carden-extension-context' style='all: initial;height: 100%;width: 100%;position: fixed;top: 0px;left: 0px;z-index: 9999999999!important;margin: 0px!important;padding: 0px!important;border: 0px!important;' src='" + chrome.runtime.getURL('../html/context.html') + "'></iframe>");
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.type == "new-session") {
            newSession();
        } else if (request.type == "new-context-card") {
            selection = request.selection;
            side = request.side;
            newCard();
        } else if (request.type == "get-context-selection") {
            sendResponse({
                selection: selection,
                side: side
            });
        } else if (request.type == "close-context") {
            $("#carden-extension-context").remove();
        } else if (request.type == "end-session") {
            $("#flashcard-extension").remove();
        }
    });
});