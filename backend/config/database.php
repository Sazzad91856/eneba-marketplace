<?php
declare(strict_types=1);

/**
 * Loads a local .env file when present.
 * On Render, database settings are read from the service's Environment Variables.
 */
function loadEnv(string $path): void
{
    if (!is_file($path) || !is_readable($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim(trim($value), "\"'");

        if ($name !== '' && getenv($name) === false && !isset($_ENV[$name])) {
            $_ENV[$name] = $value;
            putenv($name . '=' . $value);
        }
    }
}

function getDatabaseConnection(): PDO
{
    // Local development can use backend/.env. Render uses configured environment variables.
    loadEnv(__DIR__ . '/../.env');

    $required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    $config = [];

    foreach ($required as $key) {
        $value = getenv($key);
        if ($value === false || $value === '') {
            $value = $_ENV[$key] ?? $_SERVER[$key] ?? '';
        }

        if ($value === '') {
            throw new RuntimeException('Missing required database environment variable: ' . $key);
        }
        $config[$key] = $value;
    }

    $dsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s;sslmode=require',
        $config['DB_HOST'],
        $config['DB_PORT'],
        $config['DB_NAME']
    );

    return new PDO($dsn, $config['DB_USER'], $config['DB_PASSWORD'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
