<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $sql = "SELECT * FROM users WHERE user_id='$auth'";
	    $result = mysqli_query($conn, $sql);
	    if (mysqli_num_rows($result) == 0) {
	        $sql = "INSERT INTO users (user_id, level, points, streak) VALUES ('$auth', 1, 0, 0)";
            if (mysqli_query($conn, $sql)) {
                echo "no";   
            } else {
                echo("Error description: " . mysqli_error($conn));
            }
	    } else {
	        echo "yes";
	    }
	}
?>