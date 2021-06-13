<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $name = html_entity_decode($_POST["name"]);
	    $sql = "INSERT INTO decks (name, user) VALUES ('$name', '$auth')";
        if (mysqli_query($conn, $sql)) {
            echo "Success";
        } else {
            echo("Error description: " . mysqli_error($conn));
        }
	}
?>