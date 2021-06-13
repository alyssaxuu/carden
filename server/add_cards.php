<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $cards = json_decode(html_entity_decode($_POST["cards"]), true);
	    $deck = html_entity_decode($_POST["deck"]);
	    foreach ($cards as $card) {
	        $front = $card['front'];
	        $back = $card['back'];
	        $sql = "INSERT INTO cards (question, answer, source, user, deck) VALUES ('$front', '$back', 'No source', '$auth', '$deck')";
            if (mysqli_query($conn, $sql)) {
                $sql = "UPDATE users SET cards=cards+1 WHERE user_id='$auth'";
                if (mysqli_query($conn, $sql)) {
                    echo "Success";
                } else {
                    echo("Error description: " . mysqli_error($conn));
                }
            }
	    }
	}
?>