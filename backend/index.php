<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config/database.php';

try {
    $pdo = getDatabaseConnection();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'PHP successfully connected to Supabase PostgreSQL!',
    ], JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    error_log('Database connection failed: ' . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed. Check the Render environment variables and service logs.',
    ], JSON_UNESCAPED_SLASHES);
}
