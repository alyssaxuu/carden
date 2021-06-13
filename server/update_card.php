<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $id = html_entity_decode($_POST["id"]); 
	    $question = html_entity_decode($_POST["question"]);
	    $answer = html_entity_decode($_POST["answer"]);
	    $source = html_entity_decode($_POST["source"]);
	    $deck = html_entity_decode($_POST["deck"]);
	    $sql = "UPDATE cards SET question='$question', answer='$answer', source='$source', deck='$deck' WHERE id='$id' AND user='$user'";
        if (mysqli_query($conn, $sql)) {
            echo "Success";
        } else {
            echo("Error description: " . mysqli_error($conn));
        }
	}
?>