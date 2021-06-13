$(document).ready(function(){  
    const radius = 31;
    const circumference = radius * 2 * Math.PI;
    var cardflipped = false;
    var cardreview = false;
    var qanda = [{q:"Who coined the term metamodernism", a:"Mas'ud Zavarzadeh"},{q:"Who coined the term metamodernism", a:"Mas'ud Zavarzadeh"}, {q:"HWho coined the term metamodernism", a:"Mas'ud Zavarzadeh"}, {q:"Who coined the term metamodernism", a:"Mas'ud Zavarzadeh"}];
    var level = 0;
    var points = 0;
    var currentcard = 1;
    var shortcuts_active = false;
    var action_type = "";
    var quality = 0;
    var action = "";
    var correct = false;
    var currentdeck = 0;
    var total = {correct:0, incorrect:0, forgotten:0, points:0, complete:0};
    getDeck();
    
    // This has all the level data
    var levels = [
        {name:"Tiny seedling", points:1000, level:1, src:"../assets/images/seedling.svg"},
        {name:"Lil'Leaf", points:2500, level:2, src:"../assets/images/lilleaf.png"},
        {name:"Tana Bata", points:4000, level:3, src:"../assets/images/tanabata.png"},
        {name:"Olive You", points:6500, level:4, src:"../assets/images/oliveyou.png"},
        {name:"Peter Pine", points:10000, level:5, src:"../assets/images/peterpine.png"},
        {name:"Sunny Side", points:15000, level:6, src:"../assets/images/sunnyside.png"},
        {name:"Pretty Palm", points:20000, level:7, src:"../assets/images/prettypalm.png"},
        {name:"Tipsy Tournesol", points:25000, level:8, src:"../assets/images/tipsytournesol.png"},
        {name:"Sakura Sister", points:30000, level:9, src:"../assets/images/sakurasister.png"},
        {name:"Mighty Mushroom", points:35000, level:10, src:"../assets/images/mightymushroom.png"},
        {name:"Dragon Flower", points:40000, level:11, src:"../assets/images/dragonflower.png"},
        {name:"Sassy Salad", points:45000, level:12, src:"../assets/images/sassysalad.png"},
        {name:"Not-so-lucky Luke", points:50000, level:13, src:"../assets/images/notsoluckyluke.png"},
        {name:"M. Equinox", points:55000, level:14, src:"../assets/images/mequinox.png"},
        {name:"Oh Canada", points:60000, level:15, src:"../assets/images/ohcanada.png"},
        {name:"Lucky Luke", points:65000, level:16, src:"../assets/images/luckyluke.png"},
        {name:"Cactus Ninja", points:70000, level:17, src:"../assets/images/cactusninja.png"},
        {name:"Bendy Bert", points:75000, level:18, src:"../assets/images/bendybert.png"},
        {name:"Corny Corn", points:80000, level:19, src:"../assets/images/cornycorn.png"},
        {name:"Uncle Tree", points:85000, level:20, src:"../assets/images/uncletree.png"},
        {name:"Mighty Sapin", points:100000, level:21, src:"../assets/images/Mighty Sapin.png"}
    ];
    
    function getDeck() {
        chrome.runtime.sendMessage({type: "deck"}, function(response) {
            currentdeck = response.deck;
            getCards();
        });
    }
    
    function updateLevel() {
        var flag = false;
        levels.forEach(function(level, index){
            if (points < level.points && !flag) {
                flag = true;
                var newlevel = level.level;
                $("#session-level-name").html(level.name);
                $("#session-level-number").html("Level "+newlevel);
                $("#session-level-image").attr("src", level.src);
                if (newlevel == 1) {
                    setProgress(((points)*100)/level.points);
                } else {
                    setProgress(((points-levels[index-1].points)*100)/(level.points-levels[index-1].points));
                }
            }
        })
    }
    
    function showPoints(points) {
        $("#new-points span").html("+"+points);
        $("#new-points").addClass("got-points");
        window.setTimeout(function(){
            $(".got-points").removeClass("got-points");
        }, 2000)
    }
    
    function getCards() {
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/get_cards.php", {auth_id: result.auth_token, deck:currentdeck}, function(data) {
                qanda = JSON.parse(data);
                getLevel();
            });
        });
    }
    
    function getLevel() {
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/get_level.php", {auth_id: result.auth_token}, function(data) {
                level = JSON.parse(data)[0];
                points = JSON.parse(data)[1];
                sessionLoaded();
            });
        });
    }
    
    // Session is loaded
    function sessionLoaded() {
        $(".css-transitions-only-after-page-load").removeClass("css-transitions-only-after-page-load");
        $("#session-current-card").find(".session-card-front .session-card-inner-text").html(qanda[0].q);
        $("#session-current-card").find(".session-card-back .session-card-inner-text").html(qanda[0].a);
        $("#session-current-card").find(".session-card-back .session-card-source").html(qanda[0].s.replace(/^https?:\/\//,''));
        $("#session-next-card .session-card-back .session-card-source").attr("href", qanda[0].s);
        if (qanda.length > 1) {
            $("#session-next-card").find(".session-card-front .session-card-inner-text").html(qanda[1].q);
            $("#session-next-card").find(".session-card-back .session-card-inner-text").html(qanda[1].a);
            $("#session-next-card").find(".session-card-back .session-card-source").html(qanda[1].s.replace(/^https?:\/\//,''));
            $("#session-next-card .session-card-back .session-card-source").attr("href", qanda[1].s);
        }
        window.setTimeout(function(){
            $("#session-wrapper").addClass("session-wrapper-loaded");
            $("#session-current-card").removeClass("session-card-preload"); 
        }, 100);
        levelBadge();
        total = {correct:0, incorrect:0, forgotten:0, points:0, complete:0};
        resizeToFit();
    }
    
    // Level badge progress ring
    function levelBadge() {
        var circle = $("#session-progress-ring-circle");
        circle.attr("stroke-dasharray", circumference);
        updateLevel();
    }
    
    // Set level progress
    function setProgress(percent) {
        var circle = $("#session-progress-ring-circle");
        const offset = circumference - percent / 100 * circumference;
        circle.attr("stroke-dashoffset", offset);
    }
    
    // The close button is clicked
    $(document).on("click", "#session-close-card", function(){
        endSession();
    });
    
    $(document).on("click", "#finish-button", function(){
        endSession();
    });
    
    // End session
    function endSession() {
        $("#session-wrapper").removeClass("session-wrapper-loaded");
        window.setTimeout(function(){
            chrome.runtime.sendMessage({type: "end-session"})
        }, 500);
    }
    
    // Clicking whole card area
    $(document).on("click", ".session-current .session-card-wrapper", function(){
        if (cardreview) {
            cardreview = false;
            $(".session-current .session-card-wrapper").addClass('is-flipped'); 
            $("#session-back").html("Show the question again");
        } 
    });
    
    // When "I know" is clicked
    $(document).on("click", ".session-current .session-card-know", function(){
        if (!cardflipped) {
            action_type = "know"
            cardflipped = true;
            flipCard();
        } else {
            action = "correct";
            correct = true;
            spacedRepetition(true, qanda[currentcard-2].id);
            cardflipped = false;
            nextCard();
        }
    });
    
    // When "I forgot" is clicked
    $(document).on("click", ".session-current .session-card-forgot", function(){
        if (!cardflipped) {
            action_type = "forgot";
            cardflipped = true;
            flipCard();
        } else {
            action = "incorrect";
            correct = false;
            spacedRepetition(false, qanda[currentcard-2].id);
            cardflipped = false;
            nextCard();
        }
    });
    
    // When "Unsure" is clicked 
    $(document).on("click", "#session-unsure", function(){
        if (!cardflipped) {
            action_type = "unsure";
            cardflipped = true;
            flipCard();
        }
    });
    
    // See the question again
    $(document).on("click", "#session-back", function(){
        if (!cardreview) {
            cardreview = true;
            $(".session-current .session-card-wrapper").removeClass('is-flipped'); 
            $("#session-back").html("Go back to the answer");
        } else {
            cardreview = false;
            $(".session-current .session-card-wrapper").addClass('is-flipped'); 
            $("#session-back").html("Show the question again");
        }
    });
    
    function resizeToFit() {
        $(".session-card-inner-text").each(function(){
           if ($(this).text().length <= 50) {
               $(this).css("font-size", "35px");
           } else if ($(this).text().length <= 70) {
               $(this).css("font-size", "30px");
           } else if ($(this).text().length <= 120) {
               $(this).css("font-size", "25px");
           } else if ($(this).text().length <= 250) {
               $(this).css("font-size", "20px");
           } else {
               $(this).css("font-size", "18px");
           }
        });
    }

    // Flip a card
    function flipCard() {
        $(".session-current .session-card-wrapper").addClass('is-flipped'); 
        window.setTimeout(function(){
            $(".session-current .session-card-front .session-card-buttons").remove();
            $(".session-current .session-card-front .session-card-inner").css("height", "calc(100% - 38px)");
            $("#session-unsure").addClass("session-hide-bottom");
            $("#session-back").removeClass("session-hide-bottom");
        },500);
        currentcard++;
        resizeToFit();
    }
    
    // Show next card
    function nextCard() {
        $("#session-unsure").removeClass("session-hide-bottom");
        $("#session-back").addClass("session-hide-bottom");
        if (currentcard < qanda.length) {
            var nextcard = $("#session-next-card");
            nextcard.addClass("session-card-show");
            $("#session-current-card").addClass("session-card-hide");
            window.setTimeout(function(){
                $("#session-current-card").remove();
                nextcard.attr("id", "session-current-card");
                nextcard.clone().attr("id", "session-next-card").removeClass("session-card-show").appendTo("#session-wrapper");
                $("#session-next-card .session-card-wrapper").removeClass("is-flipped");
                $("#session-next-card .session-card-front .session-card-inner-text").html(qanda[currentcard].q);
                $("#session-next-card .session-card-back .session-card-inner-text").html(qanda[currentcard].a);
                $("#session-next-card .session-card-back .session-card-source").html(qanda[currentcard].s.replace(/^https?:\/\//,''));
                $("#session-next-card .session-card-back .session-card-source").attr("href", qanda[currentcard].s);
                nextcard.addClass("session-current");
                nextcard.removeClass("session-card-show");
            },800);
        } else if (currentcard == qanda.length) {
            var nextcard = $("#session-next-card");
            nextcard.addClass("session-card-show");
            $("#session-current-card").addClass("session-card-hide");
            window.setTimeout(function(){
                $("#session-current-card").remove();
                nextcard.attr("id", "session-current-card");
                nextcard.addClass("session-current");
                nextcard.removeClass("session-card-show");
            },800);
        } else {
            finishSession();
        }
        var add_width = 100/qanda.length;
        if (correct) {
            $("#session-correct").css("width", "calc("+add_width+"% + "+$("#session-correct").width()+"px)");
        } else {
            $("#session-incorrect").css("width", "calc("+add_width+"% + "+$("#session-incorrect").width()+"px)");
        }
    }
    
    // Trigger keyboard shortcuts
    $("#session-shortcuts").on("click", function(){
        if (!shortcuts_active) {
            $("#session-shortcuts-panel").removeClass("session-shortcuts-off");
            $("#session-shortcuts").addClass("shortcuts-active");
            shortcuts_active = true;
        } else {
            shortcuts_active = false;
            $("#session-shortcuts-panel").addClass("session-shortcuts-off");
            $("#session-shortcuts").removeClass("shortcuts-active");
        }
    });
    
    // Detect key press
    $(document).on('keydown',function(e) {
        // Right arrow
        if (e.which == 39) {
            if (!cardflipped) {
                action_type = "know";
                $(".session-current .session-card-front .session-card-know").addClass("keydown");
                window.setTimeout(function(){
                    window.setTimeout(function(){
                        $(".session-current .session-card-front .session-card-know").click();
                    },100);
                    $(".session-current .session-card-front .session-card-know").removeClass("keydown");
                },150);
            } else {
                spacedRepetition(true, qanda[currentcard-2].id);
                correct = true;
                $(".session-current .session-card-back .session-card-know").addClass("keydown");
                window.setTimeout(function(){
                    window.setTimeout(function(){
                        $(".session-current .session-card-back .session-card-know").click();
                    },100);
                    $(".session-current .session-card-back .session-card-know").removeClass("keydown");
                },150);
            }
            
        }
        // Left arrow
        if (e.which == 37) {
            if (!cardflipped) {
                action_type = "forgot";
                $(".session-current .session-card-front .session-card-forgot").addClass("keydown");
                window.setTimeout(function(){
                    window.setTimeout(function(){
                        $(".session-current .session-card-front .session-card-forgot").click();
                    },100);
                    $(".session-current .session-card-front .session-card-forgot").removeClass("keydown");
                },150);
            } else {
                spacedRepetition(false, qanda[currentcard-2].id);
                correct = false;
                $(".session-current .session-card-back .session-card-forgot").addClass("keydown");
                window.setTimeout(function(){
                    window.setTimeout(function(){
                        $(".session-current .session-card-back .session-card-forgot").click();
                    },100);
                    $(".session-current .session-card-back .session-card-forgot").removeClass("keydown");
                },150);
            }
        }
        // Space bar
        if (e.which == 32) {
            if (!cardflipped) {
                action_type = "unsure";
                $(".session-current .session-card-front .session-card-know").addClass("keydown");
                window.setTimeout(function(){
                    window.setTimeout(function(){
                        $(".session-current .session-card-front .session-card-know").click();
                    },100);
                    $(".session-current .session-card-front .session-card-know").removeClass("keydown");
                },150);
            } else {
                $("#session-back").addClass("keydown");
                window.setTimeout(function(){
                    window.setTimeout(function(){
                        $("#session-back").click();
                    },100);
                    $("#session-back").removeClass("keydown");
                },150);
            }
        }
    });
    
    // Spaced repetition
    function spacedRepetition(correct, id) {
        if (action_type == "know") {
            if (correct) {
                quality = 5;
                action = "correct";
            } else {
                quality = 1;
                action = "incorrect";
            }
        } else if (action_type == "unsure") {
            if (correct) {
                quality = 4;
                action = "correct";
            } else {
                quality = 2;
                action = "incorrect";
            }
        } else {
            quality = 0;
            action = "forgotten";
        }
        var interval = 3;
        var result = algorithm(quality, parseInt(qanda.find(x => x.id === id).repetitions), parseInt(qanda.find(x => x.id === id).ease), interval);
        
        // Need an algorithm to determine how many points you get, WIP
        points = parseInt(points)+((quality*15)+50);
        chrome.storage.sync.set({points:points});
        showPoints((quality*15)+50);
        getNextDate(id, result[0], result[1]);
        total.complete++;
        total.points += (quality*15)+50;
        if (action == "correct") {
            total.correct++;
        } else if (action == "incorrect") {
            total.incorrect++;
        } else {
            total.forgotten++;
        }
    }
    
    // Next date to show card
    function getNextDate(id, interval, ease) {
        var date = new Date();
        date.setDate(date.getDate()+parseInt(interval));
        var nextdate = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2);
        chrome.storage.sync.get(['auth_token'], function(result) {
            $.post("../../server/set_next_date.php", {auth_id: result.auth_token, interval:nextdate, ease:ease, id:id, action:action, points:points}, function(data) {
                updateLevel();
            });
        });
    }
    
    // Algorithm to determine the new interval of the card
    function algorithm(quality, repetitions, ease, interval) {
        if (quality >= 3) {
            if (repetitions == 0) {
                var interval = 1;
            } else if (repetitions == 1) {
                var interval = 6;
            } else if (repetitions > 1) {
                interval = Math.ceil(interval);
                repetitions++;
                ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            }
        } else if (quality < 3) {
            repetitions = 0;
            interval = 1;
            ease = ease;
            if (ease < 1.3) {
                ease = 1.3;
            } 
        }
        return [interval, ease];
    }
    
    // Finish session
    function finishSession() {
        $("#session-unsure").css("visibility", "hidden");
        $("#session-back").css("visibility", "hidden");
        $("#session-current-card").addClass("session-card-hide");
        $("#session-close-card").css("transform", "translate(340px, -295px) scale(1)");
        $("#total-correct span").html(total.correct+"/"+total.complete);
        $("#total-incorrect span").html(total.incorrect+"/"+total.complete);
        $("#total-forgotten span").html(total.forgotten+"/"+total.complete);
        $("#total-points span").html("+"+total.points);
        window.setTimeout(function(){
            $("#session-current-card").remove();
        },800);
        $("#session-wrap-finished").addClass("finish-this");
    }
    
    // Open links in parent window
    $(document).on("click", "a", function(e) {
        e.preventDefault(); 
        window.open(this.href);
    });
});