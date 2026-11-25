<?php

require_once __DIR__ . "/../config/cors.php";

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";

try {
    // Only GET requests are allowed.
    if ($_SERVER["REQUEST_METHOD"] !== "GET") {
        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);

        exit;
    }

    $pdo = getDatabaseConnection();

    // Retrieve the latest active promotional banner.
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

    $banner = $statement->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "banner" => $banner ?: null
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    error_log("Banner API error: " . $e->getMessage());

    echo json_encode([
        "success" => false,
        "message" => "Unable to load homepage banner"
    ]);
}
