<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/session.php";

startSecureSession();

if (isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => true,
        "authenticated" => true,
        "user" => [
            "id" => $_SESSION["user_id"],
            "name" => $_SESSION["user_name"],
            "email" => $_SESSION["user_email"]
        ]
    ]);
} else {
    echo json_encode([
        "success" => true,
        "authenticated" => false,
        "user" => null
    ]);
}
