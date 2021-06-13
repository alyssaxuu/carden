$(document).ready(function() {
    var decks;
    var save = [];
    var auth;
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

    function getDecks() {
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/get_decks.php", {
                auth_id: result.auth_token
            }, function(data) {
                decks = JSON.parse(data);
                if (decks.length > 0) {
                    decks.forEach(function(deck) {
                        $("table").append("<tr id='deck" + deck.id + "'><td>" + deck.name + "</td><td class='actions-cell'><button class='edit-card'>Rename</button><button class='move-cards'>Move cards</button><button class='delete'>Delete deck and cards</button></td></tr>");
                    });
                }
            });
        });
    }

    function renderLoggedIn() {
        getDecks();
    }

    function deleteDeck() {
        var deckparent = $(this).parent().parent();
        var deckid = deckparent.attr("id").replace("deck", "");
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/delete_deck.php", {
                auth_id: result.auth_token,
                id: deckid
            }, function(data) {
                if (data == "Deleted") {
                    deckparent.remove();
                }
            });
        });
    }

    function editDeck() {
        var cardparent = $(this).parent().parent();
        var cardid = cardparent.attr("id").replace("card", "");
        save.push({
            id: cardid,
            content: []
        });
        cardparent.find("td").each(function(index) {
            if (!$(this).hasClass("actions-cell") && !$(this).hasClass("deck-cell")) {
                save[save.length - 1].content.push($(this).html());
                $(this).html("<textarea>" + $(this).html() + "</textarea>");
            } else if ($(this).hasClass("actions-cell")) {
                $(this).html("<button class='save-card'>Save</button><p class='cancel-card'>Cancel<p>")
            }
        })
    }

    function cancelDeck() {
        var cardparent = $(this).parent().parent();
        var cardid = cardparent.attr("id").replace("card", "");
        cardparent.find("td").each(function(index) {
            if (!$(this).hasClass("actions-cell")) {
                $(this).html(save.find(x => x.id == cardid).content[index]);
            } else {
                $(this).html("<button class='edit-card'>Rename</button><button class='move-cards'>Move cards</button><button class='delete'>Delete deck and cards</button>");
                save = save.filter(function(obj) {
                    return obj.id !== cardid;
                });
            }
        });
    }

    function checkInputs() {
        var cardparent = $(this).parent().parent();
        if ($(this).val() == "") {
            cardparent.find(".save-card").addClass("edit-off");
        } else {
            cardparent.find("textarea").each(function(index) {
                if ($(this).val() == "") {
                    return
                } else if (cardparent.find("textarea").length == index + 1) {
                    cardparent.find(".save-card").removeClass("edit-off");
                }
            });
        }
    }

    function saveDB(cardparent) {
        var deckid = cardparent.attr("id").replace("deck", "");
        cardparent.find(".save-card").removeClass("edit-off");
        var name = sanitize(cardparent.find("textarea")[0].value);
        $.post("../../server/update_deck.php", {
            auth_id: auth,
            name: name,
            id: deckid
        }, function(data) {
            console.log(data);
            cardparent.find("td").each(function(index) {
                if (!$(this).hasClass("actions-cell")) {
                    $(this).html($(this).find("textarea").val());
                } else {
                    $(this).html("<button class='edit-card'>Rename</button><button class='move-cards'>Move cards</button><button class='delete'>Delete deck and cards</button>");
                    save = save.filter(function(obj) {
                        return obj.id !== deckid;
                    });
                }
            });
        });
    }

    function saveDeck() {
        var cardparent = $(this).parent().parent();
        cardparent.find("textarea").each(function(index) {
            if ($(this).val() == "") {
                return
            } else if (cardparent.find("textarea").length == index + 1) {
                saveDB(cardparent);
            }
        });
    }

    function moveCards() {
        var deckparent = $(this).parent().parent();
        var deckid = deckparent.attr("id").replace("deck", "");
        $(this).addClass("moving-on");
        $(this).parent().find(".edit-card").addClass("moving-on");
        $(this).parent().find(".delete").addClass("moving-on");
        $(this).after("<div class='moving'><p class='move-label'>Move cards to:</p><select></select><button class='apply-move'>Move</button><p class='cancel-move'>Cancel<p></div>")
        var dropdown = $(this).parent().find("select");
        decks.forEach(function(deck) {
            if (deck.id != deckid) {
                dropdown.append("<option value='" + deck.id + "'>" + deck.name + "</option>");
            }
        });
        dropdown.niceSelect();
    }

    function cancelMove() {
        var deckparent = $(this).parent().parent().parent();
        deckparent.find(".edit-card").removeClass("moving-on");
        deckparent.find(".delete").removeClass("moving-on");
        deckparent.find(".move-cards").removeClass("moving-on");
        $(this).parent().remove();
    }

    function moveApply() {
        var deckparent = $(this).parent().parent().parent();
        var deckid = deckparent.attr("id").replace("deck", "");
        var newdeck = deckparent.find("select").val();
        $.post("../../server/update_card_deck.php", {
            auth_id: auth,
            olddeck: deckid,
            newdeck: newdeck
        }, function(data) {
            deckparent.find(".edit-card").removeClass("moving-on");
            deckparent.find(".delete").removeClass("moving-on");
            deckparent.find(".move-cards").removeClass("moving-on");
            deckparent.find(".moving").remove();
        });
    }

    function newCard() {
        $("body").prepend("<iframe id='carden-extension-context' style='all: initial;height: 100%;width: 100%;position: fixed;top: 0px;left: 0px;z-index: 9999999999!important;margin: 0px!important;padding: 0px!important;border: 0px!important;' src='" + chrome.runtime.getURL('../html/context.html') + "'></iframe>");
    }

    // Event handling
    $(document).on("click", ".delete", deleteDeck);
    $(document).on("click", ".edit-card", editDeck);
    $(document).on("click", ".cancel-card", cancelDeck);
    $(document).on("input", "textarea", checkInputs);
    $(document).on("click", ".save-card", saveDeck);
    $(document).on("click", ".move-cards", moveCards);
    $(document).on("click", ".cancel-move", cancelMove);
    $(document).on("click", ".apply-move", moveApply);
    $(document).on("click", "#new-card", newCard);

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

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.type == "close-context") {
            $("#carden-extension-context").remove();
        }
    })
});