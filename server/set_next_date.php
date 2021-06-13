<?php
	session_start();
	header("Access-Control-Allow-Origin: chrome-extension://effdlfnfholapaddppkjmkhmfgdbeomj");
	require 'config.php';
	$array = array();
	if (isset($_POST["auth_id"])) {
	    $auth = $_POST["auth_id"];
	    $id = $_POST["id"];
	    $ease = $_POST["ease"];
	    $action = $_POST["action"];
	    $points = $_POST["points"];
	    $interval = html_entity_decode($_POST["interval"]);
	    $time = strtotime($interval);
        $newformat = date('Y-m-d',$time);
	    $sql = "UPDATE cards SET repetitions=repetitions+1, $action=$action+1, ease='$ease', action='$action', nextdate='$newformat' WHERE id='$id'";
        if (mysqli_query($conn, $sql)) {
            $day = date("d");
            $month = date("M");
            $sql = "SELECT * FROM users WHERE user_id='$auth'";
            $result = mysqli_query($conn, $sql);
            while($row = mysqli_fetch_assoc($result)) {
                $sql = "UPDATE users SET points='$points' WHERE user_id='$auth'";
                if (mysqli_query($conn, $sql)) {
                    $session_dates = $row["session_dates"];
                    if ($session_dates != "0") {
                        $session_dates = unserialize($session_dates);
                        for ($i = 0; $i < count($session_dates); $i++) {
                            if ($session_dates[$i] == $month." ".$day) {
                                if ($action == "correct") {
                                    $correct = unserialize($row["session_correct"]);
                                    $correct[$i]++;
                                    $correct = serialize($correct);
                                    $sql = "UPDATE users SET session_correct='$correct' WHERE user_id='$auth'";
                                    if (mysqli_query($conn, $sql)) {
                                        echo "done1";
                                        exit();
                                    }
                                } else if ($action == "incorrect") {
                                    $incorrect = unserialize($row["session_incorrect"]);
                                    $incorrect[$i]++;
                                    $incorrect = serialize($incorrect);
                                    $sql = "UPDATE users SET session_incorrect='$incorrect' WHERE user_id='$auth'";
                                    if (mysqli_query($conn, $sql)) {
                                        echo "done";
                                        exit();
                                    }
                                } else {
                                    $forgotten = unserialize($row["session_forgotten"]);
                                    $forgotten[$i]++;
                                    $forgotten = serialize($forgotten);
                                    $sql = "UPDATE users SET session_forgotten='$forgotten' WHERE user_id='$auth'";
                                    if (mysqli_query($conn, $sql)) {
                                        echo "done";
                                        exit();
                                    }
                                }
                            } else if ($session_dates[$i] != $month." ".$day && $i == count($session_dates)-1) {
                                if (count($session_dates) < 6) {
                                    array_push($session_dates,$month." ".$day);
                                    $session_dates = serialize($session_dates);
                                    $sql = "UPDATE users SET session_dates='$session_dates' WHERE user_id='$auth'";
                                    if (mysqli_query($conn, $sql)) {
                                        if ($action == "correct") {
                                            $correct = unserialize($row["session_correct"]);
                                            array_push($correct, 1);
                                            $incorrect = unserialize($row["session_incorrect"]);
                                            array_push($incorrect, 0);
                                            $forgotten = unserialize($row["session_forgotten"]);
                                            array_push($forgotten, 0);
                                            $correct = serialize($correct);
                                            $incorrect = serialize($incorrect);
                                            $forgotten = serialize($forgotten);
                                            $sql = "UPDATE users SET session_correct='$correct', session_incorrect='$incorrect', session_forgotten='$forgotten' WHERE user_id='$auth'";
                                            if (mysqli_query($conn, $sql)) {
                                                echo "done";
                                                exit();
                                            }
                                            
                                        } else if ($action == "incorrect") {
                                            $incorrect = unserialize($row["session_incorrect"]);
                                            array_push($incorrect, 1);
                                            $forgotten = unserialize($row["session_forgotten"]);
                                            array_push($forgotten, 0);
                                            $correct = unserialize($row["session_correct"]);
                                            array_push($correct, 0);
                                            $incorrect = serialize($incorrect);
                                            $correct = serialize($correct);
                                            $forgotten = serialize($forgotten);
                                            $sql = "UPDATE users SET session_incorrect='$incorrect', session_correct='$correct', session_forgotten='$forgotten' WHERE user_id='$auth'";
                                            if (mysqli_query($conn, $sql)) {
                                                echo "done";
                                                exit();
                                            }
                                        } else {
                                            $forgotten = unserialize($row["session_forgotten"]);
                                            array_push($forgotten, 1);
                                            $correct = unserialize($row["session_correct"]);
                                            array_push($correct, 0);
                                            $incorrect = unserialize($row["session_incorrect"]);
                                            array_push($incorrect, 0);
                                            $incorrect = serialize($incorrect);
                                            $correct = serialize($correct);
                                            $forgotten = serialize($forgotten);
                                            $sql = "UPDATE users SET session_forgotten='$forgotten', session_correct='$correct', session_incorrect='$incorrect' WHERE user_id='$auth'";
                                            if (mysqli_query($conn, $sql)) {
                                                echo "done";
                                                exit();
                                            }
                                        }
                                    }
                                } else {
                                    array_push($session_dates,$month." ".$day);
                                    unset($session_dates[0]);
                                    $session_dates = array_values($session_dates);
                                    $session_dates = serialize($session_dates);
                                    $sql = "UPDATE users SET session_dates='$session_dates' WHERE user_id='$auth'";
                                    if (mysqli_query($conn, $sql)) {
                                        if ($action == "correct") {
                                            $correct = unserialize($row["session_correct"]);
                                            array_push($correct, 1);
                                            $incorrect = unserialize($row["session_incorrect"]);
                                            array_push($incorrect, 0);
                                            $forgotten = unserialize($row["session_forgotten"]);
                                            array_push($forgotten, 0);
                                            unset($correct[0]);
                                            unset($incorrect[0]);
                                            unset($forgotten[0]);
                                            $correct = array_values($correct);
                                            $incorrect = array_values($incorrect);
                                            $forgotten = array_values($forgotten);
                                            $correct = serialize($correct);
                                            $incorrect = serialize($incorrect);
                                            $forgotten = serialize($forgotten);
                                            $sql = "UPDATE users SET session_correct='$correct', session_incorrect='$incorrect', session_forgotten='$forgotten' WHERE user_id='$auth'";
                                            if (mysqli_query($conn, $sql)) {
                                                echo "done";
                                                exit();
                                            }
                                            
                                        } else if ($action == "incorrect") {
                                            $correct = unserialize($row["session_correct"]);
                                            array_push($correct, 0);
                                            $incorrect = unserialize($row["session_incorrect"]);
                                            array_push($incorrect, 1);
                                            $forgotten = unserialize($row["session_forgotten"]);
                                            array_push($forgotten, 0);
                                            unset($correct[0]);
                                            unset($incorrect[0]);
                                            unset($forgotten[0]);
                                            $correct = array_values($correct);
                                            $incorrect = array_values($incorrect);
                                            $forgotten = array_values($forgotten);
                                            $correct = serialize($correct);
                                            $incorrect = serialize($incorrect);
                                            $forgotten = serialize($forgotten);
                                            $sql = "UPDATE users SET session_correct='$correct', session_incorrect='$incorrect', session_forgotten='$forgotten' WHERE user_id='$auth'";
                                            if (mysqli_query($conn, $sql)) {
                                                echo "done";
                                                exit();
                                            }
                                        } else {
                                            $correct = unserialize($row["session_correct"]);
                                            array_push($correct, 0);
                                            $incorrect = unserialize($row["session_incorrect"]);
                                            array_push($incorrect, 0);
                                            $forgotten = unserialize($row["session_forgotten"]);
                                            array_push($forgotten, 1);
                                            unset($correct[0]);
                                            unset($incorrect[0]);
                                            unset($forgotten[0]);
                                            $correct = array_values($correct);
                                            $incorrect = array_values($incorrect);
                                            $forgotten = array_values($forgotten);
                                            $correct = serialize($correct);
                                            $incorrect = serialize($incorrect);
                                            $forgotten = serialize($forgotten);
                                            $sql = "UPDATE users SET session_correct='$correct', session_incorrect='$incorrect', session_forgotten='$forgotten' WHERE user_id='$auth'";
                                            if (mysqli_query($conn, $sql)) {
                                                echo "done";
                                                exit();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        $session_dates = serialize(array($month." ".$day));
                        $sql = "UPDATE users SET session_dates='$session_dates' WHERE user_id='$auth'";
                        if (mysqli_query($conn, $sql)) {
                            if ($action == "correct") {
                                $correct = serialize(array(1));
                                $forgotten = serialize(array(0));
                                $incorrect = serialize(array(0));
                                $sql = "UPDATE users SET session_correct='$correct', session_incorrect='$incorrect', session_forgotten='$forgotten' WHERE user_id='$auth'";
                                if (mysqli_query($conn, $sql)) {
                                    echo "done";
                                    exit();
                                }
                                
                            } else if ($action == "incorrect") {
                                $incorrect = serialize(array(1));
                                $forgotten = serialize(array(0));
                                $correct = serialize(array(0));
                                $sql = "UPDATE users SET session_incorrect='$incorrect', session_forgotten='$forgotten', session_correct='$correct' WHERE user_id='$auth'";
                                if (mysqli_query($conn, $sql)) {
                                    echo "done";
                                    exit();
                                }
                            } else {
                                $forgotten = serialize(array(1));
                                $incorrect = serialize(array(0));
                                $correct = serialize(array(0));
                                $sql = "UPDATE users SET session_forgotten='$forgotten', session_correct='$correct', session_incorrect='$incorrect' WHERE user_id='$auth'";
                                if (mysqli_query($conn, $sql)) {
                                    echo "done";
                                    exit();
                                }
                            }
                        }
                    }
                }
            }
        } else {
            echo "no cards";
        }
	}
?>