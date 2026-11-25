<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/session.php";

// Start PHP session
startSecureSession();

// Check whether the user is authenticated
if (empty($_SESSION["user_id"])) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);

    exit;
}

// Return authenticated user information
echo json_encode([
    "success" => true,
    "user" => [
        "id" => $_SESSION["user_id"],
        "name" => $_SESSION["user_name"] ?? "",
        "email" => $_SESSION["user_email"] ?? ""
    ]
]);
