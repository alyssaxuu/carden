<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	$array = array();
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $id = $_POST["id"];
	    $sql = "DELETE FROM decks WHERE id='$id' AND user='$auth'";
	    if ($conn->query($sql) === TRUE) {
		    $sql = "DELETE FROM cards WHERE deck='$id' AND user='$auth'";
		    if ($conn->query($sql) === TRUE) {
			echo "Deleted";
		    }
	    }
	}
?>
