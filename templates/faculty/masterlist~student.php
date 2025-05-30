<?php
session_start();
include '../../database/database.php';

header('Content-Type: application/json');

$type = $_GET['type'] ?? 'students';

try {
    match ($type) {
        'students' => fetchStudents($mysqli),
        'schools'  => fetchSchools($mysqli),
        'programs' => fetchPrograms($mysqli),
        'add_interns' => addInterns($mysqli),
        default    => throw new Exception("Invalid type specified")
    };
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}

function fetchStudents($mysqli) {
    $stmt = $mysqli->prepare("
        SELECT 
            u.user_email,
            CONCAT(u.user_first_name, ' ', u.user_last_name) AS full_name,
            i.intern_gender,
            i.intern_birthdate,
            CONCAT(i.intern_city, ', ', i.intern_province_or_state, ', ', i.intern_postal_code, ', ', i.intern_country) AS address,
            u.user_date_created,
            u.user_date_updated,
            ins.batch,
            su.school_given_id AS school,
            p.program_name,
            ins.internship_year,
            ins.internship_date_started,
            ins.internship_date_ended,
            c.company_name,
            d.department_name,
            ins.internship_job_role,
            CONCAT(s.user_id, '') AS supervisor_name,
            u2.user_email AS supervisor_email,
            s.supervisor_contact_no
        FROM users u
        JOIN school_users su ON u.user_id = su.user_id
        JOIN interns i ON su.schooluser_id = i.schooluser_id
        LEFT JOIN programs p ON i.program_id = p.program_id
        LEFT JOIN internships ins ON i.intern_id = ins.intern_id
        LEFT JOIN supervisors s ON ins.supervisor_id = s.supervisor_id
        LEFT JOIN users u2 ON s.user_id = u2.user_id
        LEFT JOIN departments d ON s.department_id = d.department_id
        LEFT JOIN companies c ON d.company_id = c.company_id
        ORDER BY u.user_date_created DESC
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($data);
}

function fetchSchools($mysqli) {
    $result = $mysqli->query("SELECT school_id, school_name FROM schools ORDER BY school_name");
    $schools = [];
    while ($row = $result->fetch_assoc()) {
        $schools[] = $row;
    }
    echo json_encode($schools);
}

function fetchPrograms($mysqli) {
    if (!isset($_GET['school_id'])) {
        throw new Exception("Missing school_id");
    }

    $school_id = (int)$_GET['school_id'];
    $stmt = $mysqli->prepare("SELECT program_id, program_name FROM programs WHERE school_id = ? ORDER BY program_name");
    $stmt->bind_param('i', $school_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $programs = [];
    while ($row = $res->fetch_assoc()) {
        $programs[] = $row;
    }
    echo json_encode($programs);
}

function addInterns($mysqli) {
    $requiredFields = ['user_email', 'user_first_name', 'user_last_name', 'school_id', 'program_id', 'school_given_id'];

    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || !is_array($_POST[$field])) {
            echo json_encode(["error" => "Missing required field array: $field"]);
            return;
        }
    }

    $count = count($_POST['user_email']);
    $responses = [];

    for ($i = 0; $i < $count; $i++) {
        $email     = trim($_POST['user_email'][$i]);
        $firstName = trim($_POST['user_first_name'][$i]);
        $lastName  = trim($_POST['user_last_name'][$i]);
        $schoolId  = $_POST['school_id'][$i];
        $programId = $_POST['program_id'][$i];
        $birthdate = $_POST['intern_birthdate'][$i] ?? null;
        $gender    = $_POST['intern_gender'][$i] ?? null;
        $city      = $_POST['intern_city'][$i] ?? null;
        $province  = $_POST['intern_province_or_state'][$i] ?? null;
        $postal    = $_POST['intern_postal_code'][$i] ?? null;
        $country   = $_POST['intern_country'][$i] ?? null;
        $schoolGivenId = trim($_POST['school_given_id'][$i]);

        $dateStarted = $_POST['internship_date_started'][$i] ?? null;
        $dateEnded   = $_POST['internship_date_ended'][$i] ?? null;
        $companyId   = $_POST['company_id'][$i] ?? null;
        $deptId      = $_POST['department_id'][$i] ?? null;
        $jobRole     = $_POST['job_role_id'][$i] ?? null;
        $supervisorId= $_POST['supervisor_id'][$i] ?? null;

        error_log("EMAIL: $email | program_id: $programId | school_id: $schoolId | given_id: $schoolGivenId");

        // Insert into users
        $stmt = $mysqli->prepare("INSERT INTO users (user_first_name, user_last_name, user_email) VALUES (?, ?, ?)");
        $stmt->bind_param('sss', $firstName, $lastName, $email);
        if (!$stmt->execute()) {
            $responses[] = ["email" => $email, "error" => "Failed to insert user: " . $stmt->error];
            continue;
        }
        $userId = $stmt->insert_id;

        // Insert into user_roles
        $stmt = $mysqli->prepare("INSERT INTO user_roles (user_id, role_name) VALUES (?, 'Student Intern')");
        $stmt->bind_param('i', $userId);
        $stmt->execute();

        // Insert into school_users
        $defaultPassword = password_hash('12345678', PASSWORD_DEFAULT); // or generate a random one
        $stmt = $mysqli->prepare("INSERT INTO school_users (user_id, school_given_id, schooluser_password) VALUES (?, ?, ?)");
        $stmt->bind_param('iss', $userId, $schoolGivenId, $defaultPassword);
        $stmt->execute();
        $schoolUserId = $stmt->insert_id;

        // Convert school name (string) to school_id
        $schoolName = $schoolId; // because you passed school name in 'school_id'
        $schoolId = null;

        $schoolQuery = $mysqli->prepare("SELECT school_id FROM schools WHERE school_name = ?");
        $schoolQuery->bind_param("s", $schoolName);
        $schoolQuery->execute();
        $schoolQuery->bind_result($fetchedSchoolId);
        if ($schoolQuery->fetch()) {
            $schoolId = $fetchedSchoolId;
        }
        $schoolQuery->close();

        if (!$schoolId) {
            $responses[] = ["email" => $email, "error" => "No matching school for name '$schoolName'"];
            continue;
        }

        // Convert program_name (string) to actual program_id
        $programName = $programId; // because you passed program_name in 'program_id'
        $programId = null;

        $programQuery = $mysqli->prepare("SELECT program_id FROM programs WHERE program_name = ? AND school_id = ?");
        $programQuery->bind_param("si", $programName, $schoolId);
        $programQuery->execute();
        $programQuery->bind_result($fetchedProgramId);
        if ($programQuery->fetch()) {
            $programId = $fetchedProgramId;
        }
        $programQuery->close();

        if (!$programId) {
            $responses[] = ["email" => $email, "error" => "No matching program for name '$programName' under school_id $schoolId"];
            continue;
        }

        // Insert into interns
        $stmt = $mysqli->prepare("INSERT INTO interns (schooluser_id, program_id, intern_birthdate, intern_gender, intern_city, intern_province_or_state, intern_postal_code, intern_country)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('iissssss', $schoolUserId, $programId, $birthdate, $gender, $city, $province, $postal, $country);
        $stmt->execute();
        $internId = $stmt->insert_id;

        // Insert into internships
        if ($dateStarted && $dateEnded && $jobRole) {
            $year = date('Y', strtotime($dateStarted));
            $stmt = $mysqli->prepare("INSERT INTO internships (intern_id, supervisor_id, schooluser_id, internship_year, internship_date_started, internship_date_ended, internship_job_role)
                VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param('iiissss', $internId, $supervisorId, $schoolUserId, $year, $dateStarted, $dateEnded, $jobRole);
            $stmt->execute();
        }

        $responses[] = ["email" => $email, "status" => "success"];
    }

    echo json_encode($responses);
}
