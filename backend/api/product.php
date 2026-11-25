
<?php

header("Content-Type: application/json");

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

    $id = $_GET["id"] ?? "";

    if ($id === "") {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Product ID is required"
        ]);

        exit;
    }

    $pdo = getDatabaseConnection();

    $sql = "
        SELECT *
        FROM public.products
        WHERE id = :id
        AND is_active = TRUE
        LIMIT 1
    ";

    $statement = $pdo->prepare($sql);

    $statement->execute([
        "id" => $id
    ]);

    $product = $statement->fetch();

    if (!$product) {
        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Product not found"
        ]);

        exit;
    }

    echo json_encode([
        "success" => true,
        "product" => $product
    ]);

} catch (Throwable $e) {

    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve product"
    ]);
}
