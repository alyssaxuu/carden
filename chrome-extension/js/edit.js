$(document).ready(function() {
    var decks;
    var save = [];
    var auth;
    var page = 0;
    var activeload = true;

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

    function link(inputText) {
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
        return replacedText;
    }

    function getCards() {
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/load_cards.php", {
                page: 0,
                auth_id: result.auth_token
            }, function(data) {
                var cards = JSON.parse(data);
                if (cards.length > 0) {
                    cards.forEach(function(card) {
                        var deckname = "Main deck";
                        if (card.d == 0) {
                            card.d = 1;
                        }
                        if (decks.length > 0) {
                            deckname = decks.find(x => x.id == card.d).name;
                        }
                        $("table").append("<tr id='card" + card.id + "'><td>" + card.q + "</td><td>" + card.a + "</td><td>" + card.s + "</td><td class='deck-cell' id='deck" + card.d + "'>" + deckname + "</td><td class='actions-cell'><button class='edit-card'>Edit</button><img class='delete-card' src='" + chrome.extension.getURL('../assets/images/deletecard.svg') + "'/></td></tr>");
                    });
                }
            });
        });
    }

    function getDecks() {
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/get_decks.php", {
                auth_id: result.auth_token
            }, function(data) {
                decks = JSON.parse(data);
                getCards();
            });
        });
    }

    function renderLoggedIn() {
        getDecks();
    }

    function deleteCard() {
        var confirm = window.confirm("Are you sure you want to delete this card?");
        if (confirm) {
            var cardparent = $(this).parent().parent();
            var cardid = cardparent.attr("id").replace("card", "");
            chrome.storage.sync.get(['auth_token'], function(result) {
                $.post("../../server/delete_card.php", {
                    auth_id: result.auth_token,
                    id: cardid
                }, function(data) {
                    console.log(data);
                    if (data == "Deleted") {
                        cardparent.remove();
                    }
                });
            });
        }
    }

    function editCard() {
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
            } else if ($(this).hasClass("deck-cell")) {
                save[save.length - 1].content.push($(this).html());
                var carddeck = $(this).attr("id").replace("deck", "");
                $(this).html("<select></select>");
                var dropdown = $(this).find("select");
                decks.forEach(function(deck) {
                    if (deck.id == carddeck) {
                        dropdown.append("<option value='" + deck.id + "' selected>" + deck.name + "</option>");
                    } else {
                        dropdown.append("<option value='" + deck.id + "'>" + deck.name + "</option>");
                    }
                });
                $(this).find("select").niceSelect();
            }
        })
    }

    function cancelCard() {
        var cardparent = $(this).parent().parent();
        var cardid = cardparent.attr("id").replace("card", "");
        cardparent.find("td").each(function(index) {
            if (!$(this).hasClass("actions-cell")) {
                $(this).html(save.find(x => x.id == cardid).content[index]);
            } else {
                $(this).html("<button class='edit-card'>Edit</button><img class='delete-card' src='" + chrome.extension.getURL('../assets/images/deletecard.svg') + "'/>");
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
        var cardid = cardparent.attr("id").replace("card", "");
        console.log(cardid);
        cardparent.find(".save-card").removeClass("edit-off");
        var question = sanitize(cardparent.find("textarea")[0].value);
        var answer = sanitize(cardparent.find("textarea")[1].value);
        var source = sanitize(cardparent.find("textarea")[2].value);
        var deck = cardparent.find("select").val();
        console.log(question);
        $.post("../../server/update_card.php", {
            auth_id: auth,
            id: cardid,
            question: question,
            answer: answer,
            source: source,
            deck: deck
        }, function(data) {
            console.log(data);
            cardparent.find("td").each(function(index) {
                if (!$(this).hasClass("actions-cell") && !$(this).hasClass("deck-cell")) {
                    $(this).html($(this).find("textarea").val());
                } else if ($(this).hasClass("actions-cell")) {
                    $(this).html("<button class='edit-card'>Edit</button><img class='delete-card' src='" + chrome.extension.getURL('../assets/images/deletecard.svg') + "'/>");
                    save = save.filter(function(obj) {
                        return obj.id !== cardid;
                    });
                } else if ($(this).hasClass("deck-cell")) {
                    $(this).html(decks.find(x => x.id == deck).name);
                }
            });
        });
    }

    function saveCard() {
        var cardparent = $(this).parent().parent();
        cardparent.find("textarea").each(function(index) {
            if ($(this).val() == "") {
                return
            } else if (cardparent.find("textarea").length == index + 1) {
                saveDB(cardparent);
            }
        });
    }

    function loadMore() {
        activeload = false;
        page++;
        $.post("../../server/load_cards.php", {
            page: page,
            auth_id: auth
        }, function(data) {
            if (data != 0) {
                const loadmore = JSON.parse(data);
                loadmore.forEach(function(card) {
                    if (card.d == 0) {
                        card.d = 1;
                    }
                    $("table").append("<tr id='card" + card.id + "'><td>" + card.q + "</td><td>" + card.a + "</td><td>" + card.s + "</td><td class='deck-cell' id='deck" + card.d + "'>" + decks.find(x => x.id == card.d).name + "</td><td class='actions-cell'><button class='edit-card'>Edit</button><img class='delete-card' src='" + chrome.extension.getURL('../assets/images/deletecard.svg') + "'/></td></tr>");
                });
                window.setTimeout(function() {
                    activeload = true;
                }, 1000)
            }
        });
    }

    function scrollBottom() {
        var scrollHeight = $(document).height();
        var scrollPos = $(window).height() + $(window).scrollTop();
        if (((scrollHeight - 300) >= scrollPos) / scrollHeight == 0) {
            if (activeload) {
                loadMore();
            }
        }
    }

    function newCard() {
        $("body").prepend("<iframe id='carden-extension-context' style='all: initial;height: 100%;width: 100%;position: fixed;top: 0px;left: 0px;z-index: 9999999999!important;margin: 0px!important;padding: 0px!important;border: 0px!important;' src='" + chrome.runtime.getURL('../html/context.html') + "'></iframe>");
    }

    // Event handling
    $(document).on("click", ".delete-card", deleteCard);
    $(document).on("click", ".edit-card", editCard);
    $(document).on("click", ".cancel-card", cancelCard);
    $(document).on("input", "textarea", checkInputs);
    $(document).on("click", ".save-card", saveCard);
    $(document).on("click", "#new-card", newCard);
    $(window).on("scroll", scrollBottom);

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
