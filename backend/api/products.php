<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Allow local development and the deployed frontend URL configured in Render.
$allowedOrigins = ['http://localhost:5173'];
$frontendUrl = getenv('FRONTEND_URL');
if ($frontendUrl !== false && $frontendUrl !== '') {
    $allowedOrigins[] = rtrim($frontendUrl, '/');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array(rtrim($origin, '/'), $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }

    $pdo = getDatabaseConnection();
    $search = trim($_GET['search'] ?? '');

    $sql = '
        SELECT
            id, title, slug, description, category, platform, region,
            price, old_price, discount_percentage, image_url, is_active, created_at
        FROM public.products
        WHERE is_active = TRUE
    ';

    $parameters = [];
    if ($search !== '') {
        $sql .= '
            AND (
                title ILIKE :search
                OR category ILIKE :search
                OR platform ILIKE :search
            )
        ';
        $parameters['search'] = '%' . $search . '%';
    }

    $sql .= ' ORDER BY created_at DESC';

    $statement = $pdo->prepare($sql);
    $statement->execute($parameters);
    $products = $statement->fetchAll();

    echo json_encode([
        'success' => true,
        'count' => count($products),
        'products' => $products,
    ], JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    error_log('Products API error: ' . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to retrieve products. Check the Render service logs.',
    ]);
}
