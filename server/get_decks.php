<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	$array = array();
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $sql = "SELECT * FROM decks WHERE user='$auth'";
        $result = mysqli_query($conn, $sql);
        if (mysqli_num_rows($result) > 0) {
            while($row = mysqli_fetch_assoc($result)) {
                $data = new stdClass(); // create a new object
                $data->id=$row["id"];
                $data->name=$row["name"];
                array_push($array,$data);
            }
            echo json_encode($array);
        } else {
            echo 0;
        }
	}
?>