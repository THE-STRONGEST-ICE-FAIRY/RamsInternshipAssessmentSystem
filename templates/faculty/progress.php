<?php
session_start();
include '../../database/database.php';

$academicYear = $_SESSION['academic_year'] ?? null;
if (!$academicYear) {
    http_response_code(400);
    echo json_encode(['error' => 'Academic year not in session']);
    exit;
}

$years = explode('-', $academicYear);
$startYear = (int)$years[0]; // e.g., 2024
$endYear = $startYear + 1;   // e.g., 2025

$response = [];

// Total interns
$internsResult = $mysqli->query("SELECT COUNT(*) as total FROM interns");
$response['totalInterns'] = $internsResult->fetch_assoc()['total'] ?? 0;

// INTERN1 and INTERN2
$stmt = $mysqli->prepare("
    SELECT internship_year, COUNT(*) as count
    FROM internships
    WHERE YEAR(internship_date_started) = ?
    GROUP BY internship_year
");
$stmt->bind_param("i", $startYear);
$stmt->execute();
$result = $stmt->get_result();

$response['intern1'] = 0;
$response['intern2'] = 0;

while ($row = $result->fetch_assoc()) {
    if ($row['internship_year'] === 'INTERN1') {
        $response['intern1'] = (int)$row['count'];
    } elseif ($row['internship_year'] === 'INTERN2') {
        $response['intern2'] = (int)$row['count'];
    }
}

$_SESSION['intern1_count'] = $response['intern1'];
$_SESSION['intern2_count'] = $response['intern2'];

// Deployed & undeployed
$stmt2 = $mysqli->prepare("
    SELECT 
        SUM(CASE WHEN supervisor_id IS NOT NULL THEN 1 ELSE 0 END) AS deployed,
        SUM(CASE WHEN supervisor_id IS NULL THEN 1 ELSE 0 END) AS undeployed
    FROM internships
    WHERE YEAR(internship_date_started) = ?
");
$stmt2->bind_param("i", $startYear);
$stmt2->execute();
$result2 = $stmt2->get_result();
$deployData = $result2->fetch_assoc();

$response['deployedStudents'] = (int)($deployData['deployed'] ?? 0);
$response['nonDeployedStudents'] = (int)($deployData['undeployed'] ?? 0);

header('Content-Type: application/json');
echo json_encode($response);
?>
