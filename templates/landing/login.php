<?php
session_start();
include '../../database/database.php';

header('Content-Type: application/json'); // 💉 Set that sweet JSON blood type

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    exit;
}

// Get user info
$stmt = $mysqli->prepare("
    SELECT su.schooluser_id, su.schooluser_password, u.user_id, u.user_first_name, u.user_last_name
    FROM school_users su
    INNER JOIN users u ON su.user_id = u.user_id
    WHERE u.user_email = ?
    LIMIT 1
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();

    if (password_verify($password, $row['schooluser_password'])) {
        $user_id = $row['user_id'];

        // Fetch all roles for user
        $role_stmt = $mysqli->prepare("
            SELECT role_name FROM user_roles WHERE user_id = ?
        ");
        $role_stmt->bind_param("i", $user_id);
        $role_stmt->execute();
        $role_result = $role_stmt->get_result();

        $roles = [];
        while ($r = $role_result->fetch_assoc()) {
            $roles[] = $r['role_name'];
        }

        // Define role priority
        $role_priority = [
            "Executive Director",
            "Program Director",
            "Internship Officer",
            "Admin",
            "Industry Supervisor",
            "Student Intern"
        ];

        // Map roles to specific redirects
        $redirect_map = [
            "Executive Director"    => "/_rias/templates/faculty/_index.html",
            "Program Director"      => "/_rias/templates/faculty/_index.html",
            "Internship Officer"    => "/_rias/templates/faculty/_index.html",
            "Admin"                 => "/_rias/templates/admin/_index.html",
            "Industry Supervisor"   => "/_rias/templates/supervisor/_index.html",
            "Student Intern"        => "/_rias/templates/student/_index.html"
        ];
        
        $redirect = "";
        $selected_role = "";

        foreach ($role_priority as $role) {
            if (in_array($role, $roles)) {
                $redirect = $redirect_map[$role];
                $selected_role = $role;
                break;
            }
        }        

        if ($redirect === "") {
            echo json_encode(["success" => false, "message" => "Unauthorized: You do not have permission to access this system."]);
            exit;
        }

        // Set session values
        $_SESSION['user_id'] = $user_id;
        $_SESSION['schooluser_id'] = $row['schooluser_id'];
        $_SESSION['name'] = $row['user_first_name'] . ' ' . $row['user_last_name'];
        $_SESSION['role'] = $selected_role;
        session_regenerate_id(true);

        // 🍙 Return JSON response
        echo json_encode([
            "success" => true,
            "redirect" => $redirect
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found."]);
}
?>
