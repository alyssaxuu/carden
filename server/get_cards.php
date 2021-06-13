<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	$array = array();
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $deck = $_POST["deck"];
	    if ($deck == 0 || $deck == "0") {
	        $sql = "SELECT * FROM cards WHERE user='$auth' AND nextdate <= NOW()";
	    } else {
	        $sql = "SELECT * FROM cards WHERE user='$auth' AND nextdate <= NOW() AND deck='$deck'";
	    }
        $result = mysqli_query($conn, $sql);
        if (mysqli_num_rows($result) > 0) {
            while($row = mysqli_fetch_assoc($result)) {
                $data = new stdClass(); // create a new object
                $data->id=$row["id"];
                $data->q=$row["question"];
                $data->a=$row["answer"];
                $data->s=$row["source"];
                $data->nextdate=$row["nextdate"];
                $data->repetitions=$row["repetitions"];
                $data->ease=$row["ease"];
                array_push($array,$data);
            }
            echo json_encode($array);
        } else {
            echo 0;
        }
	}
?>