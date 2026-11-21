
<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/database.php";

try {
    $pdo = getDatabaseConnection();

    echo json_encode([
        "success" => true,
        "message" => "PHP successfully connected to Supabase PostgreSQL!"
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed.",
        "error" => $e->getMessage()
    ]);

}
