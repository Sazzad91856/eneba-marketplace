
<?php

function configureCors(): void
{
    $allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ];

    $frontendUrl = getenv("FRONTEND_URL");

    if ($frontendUrl !== false && $frontendUrl !== "") {
        $allowedOrigins[] = rtrim($frontendUrl, "/");
    }

    $origin = rtrim($_SERVER["HTTP_ORIGIN"] ?? "", "/");

    if ($origin !== "" && in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Credentials: true");
        header("Vary: Origin");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    $requestMethod = $_SERVER["REQUEST_METHOD"] ?? "GET";

    if ($requestMethod === "OPTIONS") {
        http_response_code(204);
        exit;
    }
}

configureCors();
