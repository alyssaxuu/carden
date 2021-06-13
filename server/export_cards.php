<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	$array = array();
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $sql = "SELECT * FROM cards WHERE user='$auth'";
        $result = mysqli_query($conn, $sql);
        if (mysqli_num_rows($result) > 0) {
            while($row = mysqli_fetch_assoc($result)) {
                $data = new stdClass(); // create a new object
                $data->q = $row["question"];
                $data->a = $row["answer"];
                $data->source = $row["source"];
                $data->repetitions = $row["repetitions"];
                $data->correct = $row["correct"];
                $data->incorrect = $row["incorrect"];
                $data->forgotten = $row["forgotten"];
                $data->action = $row["action"];
                $data->next = $row["nextdate"];
                array_push($array,$data);
            }
            echo json_encode($array);
        } else {
            echo 0;
        }
	}
?>