<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/session.php";

startSecureSession();

function sendResponse(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Only GET requests are allowed.
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(405, [
        "success" => false,
        "message" => "Method not allowed."
    ]);
}

// Check login session.
if (empty($_SESSION["user_id"])) {
    sendResponse(401, [
        "success" => false,
        "message" => "Please log in to view your orders."
    ]);
}

try {
    $pdo = getDatabaseConnection();

    $userId = $_SESSION["user_id"];

    // Retrieve orders belonging to the logged-in user.
    $orderQuery = $pdo->prepare("
        SELECT
            id,
            order_number,
            first_name,
            last_name,
            email,
            payment_method,
            total,
            status,
            created_at
        FROM public.orders
        WHERE user_id = :user_id
        ORDER BY created_at DESC
    ");

    $orderQuery->execute([
        ":user_id" => $userId
    ]);

    $orders = $orderQuery->fetchAll();

    // Retrieve purchased products for each order.
    $itemQuery = $pdo->prepare("
        SELECT
            product_id,
            product_name,
            seller_id,
            seller_name,
            offer_id,
            unit_price,
            quantity,
            line_total
        FROM public.order_items
        WHERE order_id = :order_id
        ORDER BY created_at ASC
    ");

    $result = [];

    foreach ($orders as $order) {
        $itemQuery->execute([
            ":order_id" => $order["id"]
        ]);

        $items = $itemQuery->fetchAll();

        $formattedItems = [];

        foreach ($items as $item) {
            $formattedItems[] = [
                "productId" => $item["product_id"],
                "productName" => $item["product_name"],
                "sellerId" => $item["seller_id"],
                "sellerName" => $item["seller_name"],
                "offerId" => $item["offer_id"],
                "unitPrice" => (float) $item["unit_price"],
                "quantity" => (int) $item["quantity"],
                "lineTotal" => (float) $item["line_total"]
            ];
        }

        $result[] = [
            "id" => $order["id"],
            "orderNumber" => $order["order_number"],
            "customerName" => $order["first_name"] . " " . $order["last_name"],
            "email" => $order["email"],
            "paymentMethod" => $order["payment_method"],
            "total" => (float) $order["total"],
            "status" => $order["status"],
            "createdAt" => $order["created_at"],
            "items" => $formattedItems
        ];
    }

    sendResponse(200, [
        "success" => true,
        "count" => count($result),
        "orders" => $result
    ]);

} catch (Throwable $error) {

    error_log("My orders API error: " . $error->getMessage());

    sendResponse(500, [
        "success" => false,
        "message" => "Unable to retrieve your orders."
    ]);
}
