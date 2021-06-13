$(document).ready(function() {
    var auth;
    var decks;
    var source = "";
    $("#deck-select").niceSelect();
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: "get-context-selection"
        }, function(response) {
            if (response.side == "front") {
                $("#input-question").val(response.selection);
            } else {
                $("#input-answer").val(response.selection);
            }
        });
    });
    
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        source = tabs[0].url;
        $("#source-preset").html(source);
    });

    function closeMenu() {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "close-context"
            });
        });
    }
    
    // Sanitize inputs
    function sanitize(string) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
        };
        const reg = /[&<>"'/]/ig;
        return string.replace(reg, (match) => (map[match]));
    }

    function checkInputs() {
        if ($("#input-question").val() && $("#input-answer").val()) {
            $(".create-off").removeClass("create-off");
        } else if (!$("#create-card").hasClass("create-off")) {
            $("#create-card").addClass("create-off");
        }
    }
    
    // Add new card to the database
    function createCard() {
        chrome.storage.sync.get(['premium'], function(result) {
            if (!result.premium) {
                chrome.storage.sync.get(['total_cards'], function(result) {
                    if (result.total_cards >= 100) {
                        alert("You reached the 100 cards free limit, become premium to create unlimited cards.")
                    } else {
                        var question = sanitize($("#input-question").val());
                        var answer = sanitize($("#input-answer").val());
                        var source = sanitize($("#source-preset").html());
                        var deck = $("#deck-select").val();
                        $.post("../../server/add_card.php", {
                            auth_id: auth,
                            question: question,
                            answer: answer,
                            source: source,
                            deck: deck
                        }, function(data) {
                            console.log(data);
                            closeMenu();
                        });
                    }
                });
            } else {
                var question = sanitize($("#input-question").val());
                var answer = sanitize($("#input-answer").val());
                var source = sanitize($("#source-preset").html());
                var deck = $("#deck-select").val();
                $.post("../../server/add_card.php", {
                    auth_id: auth,
                    question: question,
                    answer: answer,
                    source: source,
                    deck: deck
                }, function(data) {
                    console.log(data);
                    closeMenu();
                });
            }
        });
    }

    function getDecks() {
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/get_decks.php", {
                auth_id: result.auth_token
            }, function(data) {
                $("#deck-select").html("");
                decks = JSON.parse(data);
                if (decks.length > 0) {
                    decks.forEach(function(deck) {
                        $("#deck-select").append("<option value='" + deck.id + "'>" + deck.name + "</option>");
                    });
                    $("#deck-select").niceSelect("update");
                }
            });
        });
    }

    function renderLoggedIn() {
        getDecks();
    }

    // Event handling
    $("#background").on("click", closeMenu);
    $(document).on("input", "textarea", checkInputs);
    $("#create-card").on("click", function() {
        checkInputs();
        if (!$("#create-card").hasClass("create-off")) {
            createCard();
        }
    });

    // Check if user is already logged in
    chrome.storage.sync.get(['auth_token'], function(result) {
        if (typeof result === "undefined" || jQuery.isEmptyObject(result)) {
            console.log("Not logged in");
            renderLogIn();
        } else {
            chrome.identity.getAuthToken({
                'interactive': true
            }, function(token) {
                chrome.identity.getProfileUserInfo(function(info) {
                    auth = info.id;
                    renderLoggedIn();
                });
            });

        }
    });
});