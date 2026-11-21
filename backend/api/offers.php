
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

    $productId = $_GET["product_id"] ?? "";

    if (!$productId) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Product ID is required"
        ]);

        exit;
    }

    $pdo = getDatabaseConnection();

    $query = "
        SELECT
            po.id,
            po.product_id,
            po.price,
            po.stock,
            po.delivery_type,
            s.id AS seller_id,
            s.name AS seller_name,
            s.rating AS seller_rating
        FROM public.product_offers po
        INNER JOIN public.sellers s
            ON po.seller_id = s.id
        WHERE po.product_id = :product_id
            AND po.is_active = TRUE
            AND po.stock > 0
            AND s.is_active = TRUE
        ORDER BY po.price ASC
    ";

    $statement = $pdo->prepare($query);

    $statement->execute([
        ":product_id" => $productId
    ]);

    $offers = $statement->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($offers),
        "offers" => $offers
    ]);

} catch (Throwable $e) {
    http_response_code(500);

    error_log($e->getMessage());

    echo json_encode([
        "success" => false,
        "message" => "Unable to load seller offers"
    ]);
}
