<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $deck = $_POST["deck"];
	    $sql = "SELECT * FROM users WHERE user_id='$auth'";
	    $result = mysqli_query($conn, $sql);
	    $correct = 0;
	    $incorrect = 0;
	    $forgotten = 0;
	    $daysuntil = 0;
	    while($row = mysqli_fetch_assoc($result)) {
	        $array = array($row["level"], $row["points"], $row["streak"], $row["cards"]);
	    }
        $sql = "SELECT action,COUNT(*) FROM cards WHERE user='$auth' GROUP BY action";
        $result = mysqli_query($conn, $sql);
        while($row = mysqli_fetch_assoc($result)) {
            if ($row["action"] == "correct") {
                $correct = $row["COUNT(*)"];
            } else if ($row["action"] == "incorrect") {
                $incorrect = $row["COUNT(*)"];
            } else {
                $forgotten = $row["COUNT(*)"];
            }
        }
        array_push($array, $correct, $incorrect, $forgotten);
        if ($deck == 0) {
            $sql = "SELECT * FROM cards WHERE user='$auth' ORDER BY nextdate ASC LIMIT 1";
        } else {
            $sql = "SELECT * FROM cards WHERE user='$auth' AND deck='$deck' ORDER BY nextdate ASC LIMIT 1";
        }
        $result = mysqli_query($conn, $sql);
        if (mysqli_num_rows($result)==0) {
            array_push($array, -1);
            echo json_encode($array);
        } else {
            while($row = mysqli_fetch_assoc($result)) {
                if (days_until($row["nextdate"]) < 0) {
                    $daysuntil = 0;
                } else {
                    $daysuntil = days_until($row["nextdate"]);
                }
                array_push($array, $daysuntil);
                echo json_encode($array);
            }
	    }
	}
	function days_until($date){
        return (isset($date)) ? ceil((strtotime($date) - time())/60/60/24) : FALSE;
    }
?>