<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $question = html_entity_decode($_POST["question"]);
	    $answer = html_entity_decode($_POST["answer"]);
	    $source = html_entity_decode($_POST["source"]);
	    $deck = html_entity_decode($_POST["deck"]);
	    $sql = "INSERT INTO cards (question, answer, source, user, deck) VALUES ('$question', '$answer', '$source', '$auth', '$deck')";
        if (mysqli_query($conn, $sql)) {
            $sql = "UPDATE users SET cards=cards+1 WHERE user_id='$auth'";
            if (mysqli_query($conn, $sql)) {
                echo "Success";
            }
        } else {
            echo("Error description: " . mysqli_error($conn));
        }
	}
?>