
<?php

function loadEnv(string $path): void
{
    if (!file_exists($path)) {
        throw new Exception(".env file not found");
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === "" || str_starts_with($line, "#")) {
            continue;
        }

        [$name, $value] = explode("=", $line, 2);

        $_ENV[trim($name)] = trim($value);
    }
}

function getDatabaseConnection(): PDO
{
    loadEnv(__DIR__ . "/../.env");

    $host = $_ENV["DB_HOST"];
    $port = $_ENV["DB_PORT"];
    $database = $_ENV["DB_NAME"];
    $username = $_ENV["DB_USER"];
    $password = $_ENV["DB_PASSWORD"];

    $dsn = "pgsql:host=$host;port=$port;dbname=$database;sslmode=require";

    return new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
