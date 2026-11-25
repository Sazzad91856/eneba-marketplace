<?php

function startSecureSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    // Detect HTTPS, including when running behind Render's proxy.
    $isHttps =
        (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off")
        || (
            isset($_SERVER["HTTP_X_FORWARDED_PROTO"])
            && strtolower($_SERVER["HTTP_X_FORWARDED_PROTO"]) === "https"
        );

    session_set_cookie_params([
        "lifetime" => 0,
        "path" => "/",
        "domain" => "",
        "secure" => $isHttps,
        "httponly" => true,
        "samesite" => $isHttps ? "None" : "Lax"
    ]);

    session_start();
}
