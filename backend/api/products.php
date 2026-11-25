<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../config/cors.php";
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

    $search = trim($_GET["search"] ?? "");

    $sql = "
        SELECT
            id,
            title,
            slug,
            description,
            category,
            platform,
            region,
            price,
            old_price,
            discount_percentage,
            image_url,
            is_active,
            created_at
        FROM public.products
        WHERE is_active = TRUE
    ";

    $parameters = [];

    if ($search !== "") {
        $sql .= "
            AND (
                title ILIKE :search
                OR category ILIKE :search
                OR platform ILIKE :search
            )
        ";

        $parameters["search"] = "%" . $search . "%";
    }

    $sql .= " ORDER BY created_at DESC";

    $statement = $pdo->prepare($sql);
    $statement->execute($parameters);

    $products = $statement->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($products),
        "products" => $products
    ], JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {

    error_log("Products API error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve products. Check the Render service logs."
    ]);
}
