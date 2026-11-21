
<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../config/session.php";

startSecureSession();

if (empty($_SESSION["user_id"])) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $_SESSION["user_id"],
        "name" => $_SESSION["user_name"] ?? "",
        "email" => $_SESSION["user_email"] ?? ""
    ]
]);
