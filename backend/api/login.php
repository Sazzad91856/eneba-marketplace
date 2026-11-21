
<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

try {

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);

        exit;
    }

    // Start secure PHP session
    startSecureSession();

    // Read JSON request
    $data = json_decode(file_get_contents("php://input"), true);

    if (!is_array($data)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid request data"
        ]);

        exit;
    }

    $email = strtolower(trim($data["email"] ?? ""));
    $password = $data["password"] ?? "";

    // Validate required fields
    if (!is_string($password) || $email === "" || $password === "") {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Email and password are required"
        ]);

        exit;
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid email address"
        ]);

        exit;
    }

    // Connect to database
    $pdo = getDatabaseConnection();

    // Find user by email
    $query = "
        SELECT id, name, email, password_hash
        FROM public.users
        WHERE email = :email
        LIMIT 1
    ";

    $statement = $pdo->prepare($query);

    $statement->execute([
        "email" => $email
    ]);

    $user = $statement->fetch();

    // Verify password
    if (
        !$user ||
        !password_verify($password, $user["password_hash"])
    ) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Incorrect email or password"
        ]);

        exit;
    }

    // Prevent session fixation
    session_regenerate_id(true);

    // Store authenticated user information
    $_SESSION["user_id"] = $user["id"];
    $_SESSION["user_name"] = $user["name"];
    $_SESSION["user_email"] = $user["email"];

    // Return successful login response
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => [
            "id" => $user["id"],
            "name" => $user["name"],
            "email" => $user["email"]
        ]
    ]);

} catch (Throwable $e) {

    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Login failed. Please try again."
    ]);
}
