@echo off
setlocal

REM Create directories if they don't exist
if not exist nginx\ssl mkdir nginx\ssl

REM Generate SSL certificate using OpenSSL
openssl req -x509 ^
    -nodes ^
    -days 365 ^
    -newkey rsa:2048 ^
    -keyout nginx\ssl\server.key ^
    -out nginx\ssl\server.crt ^
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo SSL certificates generated successfully!
pause
