<?php    
    $ipaddress = 'localhost';
    $host = "localhost";
    $user = "root";
    $password = "";
    $database = "rias_db";
    $port = 3306;

    // APC
    // $host = "airhub-soe.apc.edu.ph";
    // $user = 'mjkurumphang';
    // $password = 'SOETiny1!';

    $mysqli = new mysqli($host, $user, $password, $database, $port);

    if ($mysqli->connect_error) {
        die("DATABASE CONNECTION FAILED: " . $mysqli->connect_error);
    }

    $mysqli->set_charset("utf8mb4");
    date_default_timezone_set('Asia/Manila');
?>
