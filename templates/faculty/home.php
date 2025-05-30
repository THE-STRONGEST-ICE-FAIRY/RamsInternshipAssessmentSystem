<?php
session_start();
include '../../database/database.php';

$sql = "SELECT internship_date_started 
        FROM internships 
        ORDER BY internship_id DESC 
        LIMIT 1";

$result = $mysqli->query($sql);

if ($result && $row = $result->fetch_assoc()) {
    $startDate = $row['internship_date_started'];
    $startYear = date('Y', strtotime($startDate));
    $endYear = $startYear + 1;
    
    $_SESSION['academic_year'] = $startYear;
    
    echo json_encode([
        'academic_year' => $startYear
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'No data found or query failed.']);
}
?>
