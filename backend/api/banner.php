
<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../config/database.php";

try {
    if ($_SERVER["REQUEST_METHOD"] !== "GET") {
        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);

        exit;
    }

    $pdo = getDatabaseConnection();

    $query = "
        SELECT
            id,
            title,
            subtitle,
            button_text,
            button_link
        FROM public.banners
        WHERE is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
    ";

    $statement = $pdo->query($query);
    $banner = $statement->fetch();

    echo json_encode([
        "success" => true,
        "banner" => $banner ?: null
    ]);

} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load homepage banner",
        "error" => $e->getMessage()
    ]);
}
