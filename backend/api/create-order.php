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

// Only POST requests are allowed.
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(405, [
        "success" => false,
        "message" => "Method not allowed."
    ]);
}

// Check login session.
if (empty($_SESSION["user_id"])) {
    sendResponse(401, [
        "success" => false,
        "message" => "Please log in before placing an order."
    ]);
}

// Read request body.
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    sendResponse(400, [
        "success" => false,
        "message" => "Invalid request data."
    ]);
}

$customer = $data["customer"] ?? [];
$items = $data["items"] ?? [];
$paymentMethod = $data["paymentMethod"] ?? "card";

// Validate customer information.
$requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "postalCode",
    "country"
];

foreach ($requiredFields as $field) {
    if (
        !isset($customer[$field]) ||
        !is_string($customer[$field]) ||
        trim($customer[$field]) === ""
    ) {
        sendResponse(400, [
            "success" => false,
            "message" => "Missing customer information: " . $field
        ]);
    }
}

if (!filter_var($customer["email"], FILTER_VALIDATE_EMAIL)) {
    sendResponse(400, [
        "success" => false,
        "message" => "Invalid email address."
    ]);
}

if (!in_array($paymentMethod, ["card", "paypal"], true)) {
    sendResponse(400, [
        "success" => false,
        "message" => "Invalid payment method."
    ]);
}

if (!is_array($items) || count($items) === 0) {
    sendResponse(400, [
        "success" => false,
        "message" => "Your cart is empty."
    ]);
}

if (count($items) > 50) {
    sendResponse(400, [
        "success" => false,
        "message" => "Too many items in one order."
    ]);
}

try {
    $pdo = getDatabaseConnection();

    $pdo->beginTransaction();

    $userId = $_SESSION["user_id"];

    $orderNumber = "ORD-" . strtoupper(bin2hex(random_bytes(5)));

    $orderItems = [];
    $orderTotal = 0;

    // Prepare product query.
    $productQuery = $pdo->prepare("
        SELECT id, title, price
        FROM public.products
        WHERE id = :product_id
        AND is_active = TRUE
    ");

    // Prepare seller offer query.
    $offerQuery = $pdo->prepare("
        SELECT
            po.id AS offer_id,
            po.product_id,
            po.seller_id,
            po.price,
            po.stock,
            s.name AS seller_name
        FROM public.product_offers po
        INNER JOIN public.sellers s
            ON s.id = po.seller_id
        WHERE po.id = :offer_id
        AND po.product_id = :product_id
        AND po.is_active = TRUE
        AND s.is_active = TRUE
        FOR UPDATE OF po
    ");

    // Prepare order insertion.
    $orderQuery = $pdo->prepare("
        INSERT INTO public.orders (
            order_number,
            user_id,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            postal_code,
            country,
            payment_method,
            total
        )
        VALUES (
            :order_number,
            :user_id,
            :first_name,
            :last_name,
            :email,
            :phone,
            :address,
            :city,
            :postal_code,
            :country,
            :payment_method,
            :total
        )
        RETURNING id
    ");

    // Prepare order item insertion.
    $itemQuery = $pdo->prepare("
        INSERT INTO public.order_items (
            order_id,
            product_id,
            seller_id,
            offer_id,
            product_name,
            seller_name,
            unit_price,
            quantity,
            line_total
        )
        VALUES (
            :order_id,
            :product_id,
            :seller_id,
            :offer_id,
            :product_name,
            :seller_name,
            :unit_price,
            :quantity,
            :line_total
        )
    ");

    // Process every cart item.
    foreach ($items as $item) {
        $productId = $item["product"]["id"] ?? null;
        $quantity = filter_var(
            $item["quantity"] ?? null,
            FILTER_VALIDATE_INT
        );

        if (
            !is_string($productId) ||
            !is_int($quantity) ||
            $quantity < 1 ||
            $quantity > 100
        ) {
            throw new Exception("Invalid product or quantity.");
        }

        $productQuery->execute([
            ":product_id" => $productId
        ]);

        $product = $productQuery->fetch();

        if (!$product) {
            throw new Exception("A product in your cart is unavailable.");
        }

        $sellerId = null;
        $offerId = null;
        $sellerName = null;
        $unitPrice = (float) $product["price"];

        // If the customer selected a seller offer,
        // retrieve its current price from the database.
        if (!empty($item["offerId"])) {
            $offerQuery->execute([
                ":offer_id" => $item["offerId"],
                ":product_id" => $productId
            ]);

            $offer = $offerQuery->fetch();

            if (!$offer) {
                throw new Exception("A selected seller offer is unavailable.");
            }

            if ((int) $offer["stock"] < $quantity) {
                throw new Exception("Not enough seller stock available.");
            }

            $offerId = $offer["offer_id"];
            $sellerId = $offer["seller_id"];
            $sellerName = $offer["seller_name"];
            $unitPrice = (float) $offer["price"];
        }

        $lineTotal = round($unitPrice * $quantity, 2);

        $orderTotal = round($orderTotal + $lineTotal, 2);

        $orderItems[] = [
            "productId" => $product["id"],
            "productName" => $product["title"],
            "sellerId" => $sellerId,
            "sellerName" => $sellerName,
            "offerId" => $offerId,
            "unitPrice" => $unitPrice,
            "quantity" => $quantity,
            "lineTotal" => $lineTotal
        ];
    }

    // Save the main order.
    $orderQuery->execute([
        ":order_number" => $orderNumber,
        ":user_id" => $userId,
        ":first_name" => trim($customer["firstName"]),
        ":last_name" => trim($customer["lastName"]),
        ":email" => trim($customer["email"]),
        ":phone" => trim($customer["phone"]),
        ":address" => trim($customer["address"]),
        ":city" => trim($customer["city"]),
        ":postal_code" => trim($customer["postalCode"]),
        ":country" => trim($customer["country"]),
        ":payment_method" => $paymentMethod,
        ":total" => $orderTotal
    ]);

    $savedOrder = $orderQuery->fetch();

    $orderId = $savedOrder["id"];

    // Save each purchased product.
    foreach ($orderItems as $orderItem) {
        $itemQuery->execute([
            ":order_id" => $orderId,
            ":product_id" => $orderItem["productId"],
            ":seller_id" => $orderItem["sellerId"],
            ":offer_id" => $orderItem["offerId"],
            ":product_name" => $orderItem["productName"],
            ":seller_name" => $orderItem["sellerName"],
            ":unit_price" => $orderItem["unitPrice"],
            ":quantity" => $orderItem["quantity"],
            ":line_total" => $orderItem["lineTotal"]
        ]);
    }

    $pdo->commit();

    sendResponse(201, [
        "success" => true,
        "message" => "Order saved successfully.",
        "order" => [
            "id" => $orderId,
            "orderNumber" => $orderNumber,
            "customer" => $customer,
            "paymentMethod" => $paymentMethod,
            "items" => $orderItems,
            "total" => $orderTotal,
            "status" => "Demo order confirmed"
        ]
    ]);

} catch (Throwable $error) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Create order error: " . $error->getMessage());

    sendResponse(500, [
        "success" => false,
        "message" => "Unable to save your order. Please try again."
    ]);
}
