<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	$array = array();
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $page = $_POST["page"]*15;
	    $sql = "SELECT * FROM cards WHERE user='$auth' LIMIT $page, 15";
        $result = mysqli_query($conn, $sql);
        if (mysqli_num_rows($result) > 0) {
            while($row = mysqli_fetch_assoc($result)) {
                $data = new stdClass(); // create a new object
                $data->id=$row["id"];
                $data->q=$row["question"];
                $data->a=$row["answer"];
                $data->s=$row["source"];
                $data->d=$row["deck"];
                array_push($array,$data);
            }
            echo json_encode($array);
        } else {
            echo 0;
        }
	}
?>