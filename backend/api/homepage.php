
<?php

ob_start();

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    ob_end_clean();
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

    // Get active products for Best Sellers
    $bestSellersQuery = "
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
        ORDER BY created_at DESC
        LIMIT 4
    ";

    $bestSellers = $pdo
        ->query($bestSellersQuery)
        ->fetchAll(PDO::FETCH_ASSOC);

    // Get discounted products for Special Offers
    $offersQuery = "
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
        AND discount_percentage > 0
        ORDER BY discount_percentage DESC
        LIMIT 4
    ";

    $specialOffers = $pdo
        ->query($offersQuery)
        ->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "best_sellers" => $bestSellers,
        "special_offers" => $specialOffers
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load homepage products",
        "error" => $e->getMessage()
    ]);
}
