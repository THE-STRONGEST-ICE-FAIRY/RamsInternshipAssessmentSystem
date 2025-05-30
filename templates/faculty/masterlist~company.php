<?php
session_start();
include '../../database/database.php';
header('Content-Type: application/json');

try {
    $stmt = $mysqli->prepare("
        SELECT 
            c.company_id,
            c.company_email,
            c.company_name,
            c.company_website,
            c.company_address,
            c.intern_allowance,
            c.partnership_status,
            c.revenue_growth,
            c.profit_margins,
            c.roi,
            c.roa,
            COUNT(DISTINCT d.department_id) AS department_count,
            COUNT(DISTINCT s.supervisor_id) AS supervisor_count
        FROM companies c
        LEFT JOIN departments d ON c.company_id = d.company_id
        LEFT JOIN supervisors s ON d.department_id = s.department_id
        GROUP BY c.company_id
        ORDER BY c.company_date_added DESC
    ");

    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode($data);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
