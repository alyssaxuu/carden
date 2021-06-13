$(document).ready(function() {
    var auth = "";
    var session_cards = 0;
    var session_active = false;
    var level = 0;
    var points = 0;
    var streak = 0;
    var total_cards = 0;
    var correct = 0;
    var incorrect = 0;
    var forgotten = 0;
    var daysuntil = 0;
    var rendered = false;
    var stats = [];
    var source = "";
    var currentdeck = 1;
    var decks = [];

    // Check if user is a premium user
    chrome.runtime.sendMessage({
        type: "check-premium"
    });

    // This has all the level data
    var levels = [{
            name: "Tiny seedling",
            points: 1000,
            level: 1,
            src: "../assets/images/seedling.svg"
        },
        {
            name: "Lil'Leaf",
            points: 2500,
            level: 2,
            src: "../assets/images/lilleaf.png"
        },
        {
            name: "Tana Bata",
            points: 4000,
            level: 3,
            src: "../assets/images/tanabata.png"
        },
        {
            name: "Olive You",
            points: 6500,
            level: 4,
            src: "../assets/images/oliveyou.png"
        },
        {
            name: "Peter Pine",
            points: 10000,
            level: 5,
            src: "../assets/images/peterpine.png"
        },
        {
            name: "Sunny Side",
            points: 15000,
            level: 6,
            src: "../assets/images/sunnyside.png"
        },
        {
            name: "Pretty Palm",
            points: 20000,
            level: 7,
            src: "../assets/images/prettypalm.png"
        },
        {
            name: "Tipsy Tournesol",
            points: 25000,
            level: 8,
            src: "../assets/images/tipsytournesol.png"
        },
        {
            name: "Sakura Sister",
            points: 30000,
            level: 9,
            src: "../assets/images/sakurasister.png"
        },
        {
            name: "Mighty Mushroom",
            points: 35000,
            level: 10,
            src: "../assets/images/mightymushroom.png"
        },
        {
            name: "Dragon Flower",
            points: 40000,
            level: 11,
            src: "../assets/images/dragonflower.png"
        },
        {
            name: "Sassy Salad",
            points: 45000,
            level: 12,
            src: "../assets/images/sassysalad.png"
        },
        {
            name: "Not-so-lucky Luke",
            points: 50000,
            level: 13,
            src: "../assets/images/notsoluckyluke.png"
        },
        {
            name: "M. Equinox",
            points: 55000,
            level: 14,
            src: "../assets/images/mequinox.png"
        },
        {
            name: "Oh Canada",
            points: 60000,
            level: 15,
            src: "../assets/images/ohcanada.png"
        },
        {
            name: "Lucky Luke",
            points: 65000,
            level: 16,
            src: "../assets/images/luckyluke.png"
        },
        {
            name: "Cactus Ninja",
            points: 70000,
            level: 17,
            src: "../assets/images/cactusninja.png"
        },
        {
            name: "Bendy Bert",
            points: 75000,
            level: 18,
            src: "../assets/images/bendybert.png"
        },
        {
            name: "Corny Corn",
            points: 80000,
            level: 19,
            src: "../assets/images/cornycorn.png"
        },
        {
            name: "Uncle Tree",
            points: 85000,
            level: 20,
            src: "../assets/images/uncletree.png"
        },
        {
            name: "Mighty Sapin",
            points: 100000,
            level: 21,
            src: "../assets/images/Mighty Sapin.png"
        }
    ];

    // Check if user is already logged in
    chrome.storage.sync.get(['auth_token'], function(result) {
        if (typeof result === "undefined" || jQuery.isEmptyObject(result)) {
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

    // Google sign in
    $(document).on("click", "#login", function() {
        signIn();
    })

    // Log out
    $(document).on("click", "#settings-logout", function() {
        signOut();
    });

    // Sign in
    function signIn() {
        chrome.identity.getAuthToken({
            'interactive': true
        }, function(token) {
            chrome.identity.getProfileUserInfo(function(info) {
                auth = info.id;
                chrome.storage.sync.set({
                    "auth_token": auth
                }, function() {
                    $.post("../../server/chrome_login.php", {
                        auth_id: auth
                    }, function(data) {
                        renderLoggedIn();
                        startUp();
                    });
                });
            });
        });
    }

    // Sign out
    function signOut() {
        chrome.identity.removeCachedAuthToken({
            token: auth
        });
        chrome.storage.sync.remove(["auth_token"]);
        renderLogIn();
    }

    // Set circle progress
    function setProgress(percent) {
        var circle = $("#progress-ring-circle");
        var radius = 24;
        var circumference = radius * 2 * Math.PI;
        circle.attr("stroke-dasharray", circumference);
        const offset = circumference - percent / 100 * circumference;
        circle.attr("stroke-dashoffset", offset);
    }

    function updateLevel() {
        var flag = false;
        levels.forEach(function(mainlevel, index) {
            if (points < mainlevel.points && !flag) {
                flag = true;
                level = mainlevel.level;
                $("#level-name").html(mainlevel.name);
                $("#level-number").html("Level " + level);
                $("#level-image").attr("src", mainlevel.src);
                if (level == 1) {
                    setProgress(((points) * 100) / mainlevel.points);
                } else {
                    setProgress(((points - levels[index - 1].points) * 100) / (mainlevel.points - levels[index - 1].points));
                }
            }
        })
    }

    // Set current tab URL to source
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        source = tabs[0].url;
    });

    // Gets triggered on startup
    function startUp() {
        chrome.runtime.sendMessage({
            type: "startup"
        }, function(response) {
            if (!response.status) {
                session_active = false;
                getStats();
            } else {
                if (response.cards > 0) {
                    session_active = true;
                }
                session_cards = response.cards;
                getStats();
            }
        });
    }
    startUp();

    // Switching tabs (navigation)
    $(document).on("click", "#nav a", function() {
        if (!$(this).hasClass("active-nav") && $(this).attr("id") != "more-nav") {
            $(".active-nav").removeClass("active-nav");
            $(this).addClass("active-nav");
            if ($(this).attr("id") == "settings") {
                renderSettings();
            } else if ($(this).attr("id") == "new-card") {
                renderNewCard();
            } else if ($(this).attr("id") == "stats") {
                renderStats();
            }
        }
    });

    function getStats() {
        chrome.storage.sync.get(['auth_token'], function(result) {
            if (typeof result === "undefined" || jQuery.isEmptyObject(result)) {
                renderLogIn();
            } else {
                $.post("../../server/get_level.php", {
                    auth_id: result.auth_token,
                    deck: currentdeck
                }, function(data) {
                    points = JSON.parse(data)[1];
                    streak = JSON.parse(data)[2];
                    total_cards = JSON.parse(data)[3];
                    chrome.storage.sync.set({
                        total_cards: total_cards
                    });
                    correct = parseInt(JSON.parse(data)[4]);
                    incorrect = parseInt(JSON.parse(data)[5]);
                    forgotten = parseInt(JSON.parse(data)[6]);
                    daysuntil = JSON.parse(data)[7];
                    if (rendered) {
                        updateLevel();
                        $("#streak p").html(streak);
                        if (session_active) {
                            $("#session-button").attr("data-content", session_cards);
                            $("#session-button").html("Start session");
                            $("#session-button").addClass("session-ready");
                        } else {
                            if (daysuntil != -1) {
                                $("#session-button").removeClass("session-ready");
                                $("#session-button").html("Next session in " + daysuntil + "d");
                            } else {
                                $("#session-button").removeClass("session-ready");
                                $("#session-button").html("No cards in deck");
                            }
                        }
                    }
                })
            }
        });
    }

    // Show logged in screen
    function renderLoggedIn() {
        $.get(chrome.runtime.getURL('../html/logged-in.html'), function(data) {
            inject = data;
            $("body").html(data);
            chrome.storage.sync.get(['points'], function(result) {
                points = result.points;
                updateLevel();
            });
            loggedIn();
        })
    }

    // Show log in screen
    function renderLogIn() {
        $.get(chrome.runtime.getURL('../html/log-in.html'), function(data) {
            inject = data;
            $("body").html(data);
        })
    }

    // Show settings tab
    function renderSettings() {
        $.get(chrome.runtime.getURL('../html/settings.html'), function(data) {
            inject = data;
            $("#content").html(data);
            chrome.storage.sync.get(['alert'], function(result) {
                if (!result.alert) {
                    $("#new-session-alert").attr("checked", false);
                }
                chrome.storage.sync.get(['premium'], function(result) {
                    if (result.premium) {
                        $("#become-pro").attr("id", "manage-pro");
                        $("#manage-pro p ").html("Manage subscription");
                    }
                })
            });
        })
    }

    // Show new card tab
    function renderNewCard() {
        $.get(chrome.runtime.getURL('../html/new-card.html'), function(data) {
            inject = data;
            $("#content").html(data);
            $("#source-preset").html(source);
        })
    }

    function kFormatter(num) {
        return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'K' : Math.sign(num) * Math.abs(num)
    }

    // Show stats tab
    function renderStats() {
        $.get(chrome.runtime.getURL('../html/stats.html'), function(data) {
            inject = data;
            $("#content").html(data);
            $("#stats-points .stats-number").html(kFormatter(points));
            if (level == 0) {
                $("#stats-points .stats-growth").css("width", (points * 145) / levels.find(x => x.level == level).points + "px");
            } else if (level == 21) {
                $("#stats-points .stats-growth").css("width", "145px");
            } else {
                const levelindex = levels.findIndex(x => x.level == level) - 1;
                if (points < levels[0].points) {
                    $("#stats-points .stats-growth").css("width", ((points) * 145) / (levels[0].points) + "px");
                } else {
                    $("#stats-points .stats-growth").css("width", ((points - levels[levelindex].points) * 145) / (levels.find(x => x.level == level).points - levels[levelindex].points) + "px");
                }
            }
            if (total_cards == 0) {
                $("#stats-correct .stats-number").html("0%");
                $("#stats-incorrect .stats-number").html("0%");
                $("#stats-forgotten .stats-number").html("0%");
                $("#stats-correct .stats-growth").css("width", "0px");
                $("#stats-incorrect .stats-growth").css("width", "0px");
                $("#stats-forgotten .stats-growth").css("width", "0px");
            } else {
                $("#stats-correct .stats-number").html(Math.round((correct * 100) / (correct + incorrect + forgotten)) + "%");
                $("#stats-incorrect .stats-number").html(Math.round((incorrect * 100) / (correct + incorrect + forgotten)) + "%");
                $("#stats-forgotten .stats-number").html(Math.round((forgotten * 100) / (correct + incorrect + forgotten)) + "%");
                $("#stats-correct .stats-growth").css("width", (correct * 145) / (correct + incorrect + forgotten) + "px");
                $("#stats-incorrect .stats-growth").css("width", (incorrect * 145) / (correct + incorrect + forgotten) + "px");
                $("#stats-forgotten .stats-growth").css("width", (forgotten * 145) / (correct + incorrect + forgotten) + "px");
            }
        }).done(function() {
            $.post("../../server/get_stats.php", {
                auth_id: auth
            }, function(data) {
                var stats = JSON.parse(data);
                var label = [];
                var stats_correct = [];
                var stats_incorrect = [];
                var stats_forgotten = [];
                for (var i = 0; i < stats[0].length; i++) {
                    label.push(stats[0][i].split(' ').reverse());
                    stats_correct.push(parseInt(stats[1][i]));
                    stats_incorrect.push(parseInt(stats[2][i]));
                    stats_forgotten.push(parseInt(stats[3][i]));
                    if (i == stats[0].length - 1) {
                        showChart(label, stats_correct, stats_incorrect, stats_forgotten);
                    }
                }
            });
        });
    }

    // Export all data
    function exportAllData() {
        chrome.storage.sync.get(['premium'], function(result) {
            if (!result.premium) {
                renderPremium();
            } else {
                exportCSV(true, true);
            }
        })
    }

    // Show import settings
    function renderImport() {
        chrome.storage.sync.get(['premium'], function(result) {
            if (result.premium) {
                $.get(chrome.runtime.getURL('../html/import.html'), function(data) {
                    inject = data;
                    $("#content").html(data);
                })
            } else {
                renderPremium();
            }
        });
    }

    // Show export settings
    function renderExport() {
        $.get(chrome.runtime.getURL('../html/export.html'), function(data) {
            inject = data;
            $("#content").html(data);
        })
    }

    // Show premium modal
    function renderPremium() {
        $(".premium-hidden").removeClass("premium-hidden");
    }

    // Hide premium modal
    function hidePremium() {
        $("#premium-blocked").addClass("premium-hidden");
    }

    // Disable new session alerts
    function sessionAlert() {
        chrome.storage.sync.get(['alert'], function(result) {
            if (result.alert) {
                chrome.storage.sync.set({
                    alert: false
                });
                chrome.runtime.sendMessage({
                    type: "hide-alert"
                });
            } else {
                chrome.storage.sync.set({
                    alert: true
                });
                chrome.runtime.sendMessage({
                    type: "show-alert"
                });
            }
        });
    }

    // Interpret front/back for Anki
    function analyzeFileTab(str) {
        var importedcards = [];
        var tempcardtext = "";
        var currentcard = {
            front: "",
            back: ""
        };
        var isfront = true;
        for (var i = 0, n = str.length; i < n; i++) {
            // Switches to card back
            if (str.charCodeAt(i) == 9) {
                isfront = false;
                // New card
            } else if (str.charCodeAt(i) == 10) {
                importedcards.push(currentcard);
                currentcard = {
                    front: "",
                    back: ""
                };
                isfront = true;
                // Is the front of the card
            } else if (isfront) {
                currentcard.front += str[i];
                // Is the back of the card
            } else {
                currentcard.back += str[i];
            }
            // If there's no line break at the end
            if (i == n - 1) {
                if (currentcard.front != "" && currentcard.back != "") {
                    importedcards.push(currentcard);
                }
            }
        }
        if (importedcards.length >= 500) {
            alert("Cannot upload. Try adding fewer cards at a time.")
        } else if (importedcards.length >= 1) {
            chrome.storage.sync.get(['auth_token'], function(result) {
                $.post("../../server/add_cards.php", {
                    auth_id: result.auth_token,
                    cards: JSON.stringify(importedcards),
                    deck: currentdeck
                }, function(data) {
                    alert("Added successfully");
                })
            })
        } else if (importedcards.length == 0) {
            alert("No cards recognized");
        }
    }

    // Interpret front/back for CSV
    function analyzeFileComma(str) {
        var importedcards = [];
        var tempcardtext = "";
        var currentcard = {
            front: "",
            back: ""
        };
        var isfront = true;
        var quotecheck = false;
        for (var i = 0, n = str.length; i < n; i++) {
            // Detect quote
            if (str.charCodeAt(i) == 34) {
                if (quotecheck) {
                    quotecheck = false;
                } else {
                    quotecheck = true;
                }
                // Switches to card back (check for comma)
            } else if (str.charCodeAt(i) == 44) {
                // Ignore comma in question/answer
                if (!quotecheck) {
                    isfront = false;
                }
                // New card
            } else if (str.charCodeAt(i) == 10) {
                importedcards.push(currentcard);
                currentcard = {
                    front: "",
                    back: ""
                };
                isfront = true;
                // Is the front of the card
            } else if (isfront && str.charCodeAt(i) != 13) {
                currentcard.front += str[i];
                // Is the back of the card
            } else if (str.charCodeAt(i) != 13) {
                currentcard.back += str[i];
            }
            // If there's no line break at the end
            if (i == n - 1) {
                if (currentcard.front != "" && currentcard.back != "") {
                    importedcards.push(currentcard);
                }
            }
        }
        if (importedcards.length >= 500) {
            alert("Cannot upload. Try adding fewer cards at a time.")
        } else if (importedcards.length >= 1) {
            chrome.storage.sync.get(['auth_token'], function(result) {
                $.post("../../server/add_cards.php", {
                    auth_id: result.auth_token,
                    cards: JSON.stringify(importedcards),
                    deck: currentdeck
                }, function(data) {
                    alert("Added successfully");
                })
            })
        } else if (importedcards.length == 0) {
            alert("No cards recognized");
        }
    }

    // Export text file (for Anki, Quizlet...)
    function exportTXT() {
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/export_cards.php", {
                auth_id: result.auth_token
            }, function(data) {
                var exportcards = JSON.parse(data);
                var generatedtxt = "";
                exportcards.forEach(function(card) {
                    generatedtxt += card.q + "\u0009" + card.a + "\u0013\n";
                });
                var blob = new Blob([generatedtxt], {
                    type: "text/plain"
                });
                var url = URL.createObjectURL(blob);
                chrome.downloads.download({
                    url: url,
                    filename: "cardendata.txt"
                });
            });
        });
    }

    // Export CSV
    function exportCSV(titles, all) {
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/export_cards.php", {
                auth_id: result.auth_token
            }, function(data) {
                var exportcards = JSON.parse(data);
                var generatedtxt = "";
                if (!all) {
                    if (titles) {
                        generatedtxt += "Question\u0009Answer\u0013\n";
                    }
                    exportcards.forEach(function(card) {
                        generatedtxt += card.q + "\u0009" + card.a + "\u0013\n";
                    });
                } else {
                    generatedtxt += "Question\u0009Answer\u0009Source\u0009Repetitions\u0009Correct\u0009Incorrect\u0009Forgotten\u0009Current status\u0009Next date\u0013\n";
                    exportcards.forEach(function(card) {
                        generatedtxt += card.q + "\u0009" + card.a + "\u0009" + card.source + "\u0009" + card.repetitions + "\u0009" + card.correct + "\u0009" + card.incorrect + "\u0009" + card.forgotten + "\u0009" + card.action + "\u0009" + card.next + "\u0013\n";
                    });
                }
                var blob = new Blob([generatedtxt], {
                    type: "text/csv"
                });
                var url = URL.createObjectURL(blob);
                chrome.downloads.download({
                    url: url,
                    filename: "cardendata.csv"
                });
            });
        });
    }

    function handleImport() {
        var exportformat = $("input[name='export-format']:checked").val();
        var fr = new FileReader();
        fr.onload = function() {
            if (exportformat == "csv") {
                analyzeFileTab(fr.result);
            } else if (exportformat == "csv2") {
                analyzeFileComma(fr.result);
            } else if (exportformat = "txt") {
                analyzeFileComma(fr.result);
            }
        }
        fr.readAsText(this.files[0]);
    }

    $(document).on("change", "#import-action", handleImport);

    $(document).on("click", "#export-cards-button", function() {
        var exportformat = $("input[name='export-format']:checked").val();
        if (exportformat == "csv") {
            exportCSV(false, false);
        } else if (exportformat == "csv2") {
            exportCSV(true, false);
        } else if (exportformat = "txt") {
            exportTXT();
        }
    });

    // Switches on settings page
    $(document).on("click", ".with-switch", function(e) {
        if (!$(this).hasClass("switch")) {
            $(this).children("switch").trigger("click");
        }
    });

    // More button clicked
    $(document).on("click", "#more-nav", function() {
        if (!$(this).hasClass("more-active")) {
            moreMenu(true);
        } else {
            moreMenu(false);
        }
    });

    // Deck dropdown clicked
    $(document).on("click", "#deck", function() {
        if (!$(this).hasClass("deck-active")) {
            deckMenu(true);
        } else {
            deckMenu(false);
        }
    });

    // Log in sequence is complete (screen rendered)
    function loggedIn() {
        rendered = true;
        setProgress(0);
        $("#source-preset").html(source);
        getDecks();
    }


    // Enable create new card button
    $(document).on("input", "textarea", function() {
        if ($("#input-question").val() && $("#input-answer").val()) {
            $(".create-off").removeClass("create-off");
        } else if (!$("#create-card").hasClass("create-off")) {
            $("#create-card").addClass("create-off");
        }
    });

    // Create a new card
    $(document).on("click", "#create-card", function() {
        if (!$("#create-card").hasClass("create-off")) {
            createCard();
        }
    });

    // Add new card to the database
    function createCard() {
        chrome.storage.sync.get(['premium'], function(result) {
            if (total_cards >= 100 && !result.premium) {
                renderPremium();
            } else {
                var question = sanitize($("#input-question").val());
                var answer = sanitize($("#input-answer").val());
                var source = sanitize($("#source-preset").html());
                $.post("../../server/add_card.php", {
                    auth_id: auth,
                    question: question,
                    answer: answer,
                    source: source,
                    deck: currentdeck
                }, function(data) {
                    $("#input-question").val("")
                    $("#input-answer").val("")
                    if (typeof $("#session-button").attr("data-content") != 'undefined' && $("#session-button").attr("data-content") != false) {
                        $("#session-button").attr("data-content", parseInt($("#session-button").attr("data-content")) + 1);
                    } else {
                        $("#session-button").attr("data-content", "1");
                    }
                    $("#session-button").html("Start session");
                    $("#session-button").addClass("session-ready");
                    total_cards++;
                    chrome.storage.sync.set({
                        total_cards: total_cards
                    });
                });
            }
        })
    }

    // Start a new session
    $(document).on("click", "#session-button", function() {
        if ($(this).hasClass("session-ready")) {
            $(this).removeClass("session-ready");
            $(this).html("Next session in 1d");
            chrome.runtime.sendMessage({
                type: "new-session"
            });
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "new-session"
                });
                window.close();
            });
        }
    });

    // Detect clicks anywhere
    $(document).on('click', function(e) {

        // Not clicking on the "more menu"
        if ($(e.target).closest("#more-menu").length === 0 && $("#more-nav").hasClass("more-active") && $(e.target).closest("#more-nav").length === 0) {
            moreMenu(false);
        }

    });

    // Open/close more menu
    function moreMenu(open) {
        if (open) {
            $("#more-nav").addClass("more-active");
            $("#more-menu").removeClass("menu-closed");
        } else {
            $("#more-nav").removeClass("more-active");
            $("#more-menu").addClass("menu-closed");
        }
    }

    // Open/close deck menu
    function deckMenu(open) {
        if (open) {
            $("#deck").addClass("deck-active");
            $("#deck-menu").removeClass("menu-closed");
        } else {
            $("#new-deck").removeClass("editing-deck-name-writing");
            $("#new-deck").removeClass("editing-deck-name");
            $("#new-deck").html("<img src='../assets/images/new-deck.svg'><p>New deck</p>");
            $("#deck").removeClass("deck-active");
            $("#deck-menu").addClass("menu-closed");
        }
    }

    // Get deck list
    function getDecks() {
        $("#deck-menu").html('<div id="arrow-outer"><div id="arrow-inner"></div></div><div class="menu-section" id="new-deck"><img src="../assets/images/new-deck.svg"><p>New deck</p></div><hr><div class="menu-section deck-item" id="all-decks"><p>All cards</p></div>');
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/get_decks.php", {
                auth_id: result.auth_token
            }, function(data) {
                decks = JSON.parse(data);
                if (decks.length > 0) {
                    decks.forEach(function(deck) {
                        $("#deck-menu").append("<hr><div class='menu-section deck-item' id='deck" + deck.id + "''><p>" + deck.name + "</p></div>");
                    });
                    chrome.storage.sync.get(['deck'], function(result) {
                        currentdeck = result.deck;
                        $("#deck p").html($("#deck" + currentdeck + " p").html());
                    });
                }
            });
        });
    }

    // Create a deck
    function createDeck() {
        if ($("#new-deck p").html() != "") {
            $.post("../../server/add_deck.php", {
                auth_id: auth,
                name: sanitize($("#new-deck p").html())
            }, function(data) {
                $("#new-deck").removeClass("editing-deck-name-writing");
                $("#new-deck").removeClass("editing-deck-name");
                $("#new-deck").html("<img src='../assets/images/new-deck.svg'><p>New deck</p>");
                getDecks();
            });
        }
    }

    // Start creating a deck
    function makingNewDeck() {
        chrome.storage.sync.get(['premium'], function(result) {
            if (decks.length >= 3 && !result.premium) {
                deckMenu(false);
                renderPremium();

            } else {
                $("#new-deck").addClass("editing-deck-name");
                $("#new-deck").html("<p id='new-deck-editing'></p><img id='new-deck-button' src='../assets/images/new-deck-button.svg'>");
                $("#new-deck p").attr("contenteditable", "true");
                $("#new-deck p").focus();
            }
        })
    }

    // Switch deck
    function switchDeck() {
        $("#deck p").html($(this).find("p").html());
        currentdeck = $(this).attr("id").replace("deck", "");
        chrome.storage.sync.set({
            deck: currentdeck
        });
        deckMenu(false);
        chrome.runtime.sendMessage({
            type: "set-deck",
            deck: currentdeck
        });
        startUp();
    }

    // Get premium
    function getPremium() {
        chrome.runtime.sendMessage({
            type: "open-premium"
        });
    }

    // Manage subscription
    function managePremium() {
        chrome.runtime.sendMessage({
            type: "open-premium"
        });
    }

    // Event handling
    $(document).on("click", "#new-deck", makingNewDeck);
    $(document).on("click", "#new-deck-button", createDeck);
    $(document).on("click", ".deck-item", switchDeck);
    $(document).on("click", "#dark-mode", renderPremium);
    $(document).on("click", "#premium-later", hidePremium);
    $(document).on("click", "#import-cards", renderImport);
    $(document).on("click", "#export-cards", renderExport);
    $(document).on("click", ".go-back-settings", renderSettings);
    $(document).on("click", "#new-session-alert", sessionAlert);
    $(document).on("click", "#export-all-data", exportAllData);
    $(document).on("click", "#get-pro", getPremium);
    $(document).on("click", "#become-pro", getPremium);
    $(document).on("click", "#manage-pro", managePremium);
    $(document).on("click", "#edit-cards-button", function() {
        chrome.tabs.create({
            url: chrome.extension.getURL('../html/edit.html')
        });
    })
    $(document).on("keypress", "#new-deck", function(e) {
        $("#new-deck").removeClass("editing-deck-name");
        $("#new-deck").addClass("editing-deck-name-writing");
        return e.which != 13;
    });

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

});