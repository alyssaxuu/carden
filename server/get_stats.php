<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $array = array();
	    $sql = "SELECT * FROM users WHERE user_id='$auth'";
	    $result = mysqli_query($conn, $sql);
	    while($row = mysqli_fetch_assoc($result)) {
    	    $session_dates = unserialize($row["session_dates"]);
    	    $session_correct = unserialize($row["session_correct"]);
    	    $session_incorrect = unserialize($row["session_incorrect"]);
    	    $session_forgotten = unserialize($row["session_forgotten"]);
	    }
        array_push($array, $session_dates, $session_correct, $session_incorrect, $session_forgotten);
        echo json_encode($array);
	}
?>