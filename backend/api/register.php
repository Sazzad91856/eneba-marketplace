
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

try {

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);

        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (!is_array($data)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid request data"
        ]);

        exit;
    }

    $name = trim($data["name"] ?? "");
    $email = strtolower(trim($data["email"] ?? ""));
    $password = $data["password"] ?? "";

    // Validate required fields
    if ($name === "" || $email === "" || $password === "") {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "All fields are required"
        ]);

        exit;
    }

    // Validate name
    if (strlen($name) > 100) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Name must not exceed 100 characters"
        ]);

        exit;
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Please enter a valid email address"
        ]);

        exit;
    }

    // Validate password
    if (!is_string($password) || strlen($password) < 8) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Password must contain at least 8 characters"
        ]);

        exit;
    }

    // Connect to database
    $pdo = getDatabaseConnection();

    // Check whether email already exists
    $checkQuery = "
        SELECT id
        FROM public.users
        WHERE email = :email
        LIMIT 1
    ";

    $checkStatement = $pdo->prepare($checkQuery);

    $checkStatement->execute([
        "email" => $email
    ]);

    if ($checkStatement->fetch()) {
        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "An account with this email already exists"
        ]);

        exit;
    }

    // Securely hash password
    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    // Insert new user
    $insertQuery = "
        INSERT INTO public.users (
            name,
            email,
            password_hash
        )
        VALUES (
            :name,
            :email,
            :password_hash
        )
        RETURNING id, name, email, created_at
    ";

    $insertStatement = $pdo->prepare($insertQuery);

    $insertStatement->execute([
        "name" => $name,
        "email" => $email,
        "password_hash" => $passwordHash
    ]);

    $user = $insertStatement->fetch();

    http_response_code(201);

    echo json_encode([
        "success" => true,
        "message" => "Account created successfully",
        "user" => $user
    ]);

} catch (Throwable $e) {

    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Registration failed. Please try again."
    ]);
}
