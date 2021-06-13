<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $olddeck = html_entity_decode($_POST["olddeck"]);
	    $newdeck = html_entity_decode($_POST["newdeck"]);
	    $sql = "UPDATE cards SET deck='$newdeck' WHERE deck='$olddeck' AND user='$auth'";
        if (mysqli_query($conn, $sql)) {
            echo "Success";
        } else {
            echo("Error description: " . mysqli_error($conn));
        }
	}
?>