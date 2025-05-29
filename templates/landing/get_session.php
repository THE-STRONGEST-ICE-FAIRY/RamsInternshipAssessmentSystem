<?php
session_start();

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode($_SESSION);
} else {
    echo json_encode(["error" => "User not logged in"]);
}
?>
