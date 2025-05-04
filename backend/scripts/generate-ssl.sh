#!/bin/bash

# Create directories if they don't exist
mkdir -p nginx/ssl

# Generate SSL certificate
openssl req -x509 \
    -nodes \
    -days 365 \
    -newkey rsa:2048 \
    -keyout nginx/ssl/server.key \
    -out nginx/ssl/server.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Set permissions
chmod 644 nginx/ssl/server.crt
chmod 600 nginx/ssl/server.key

echo "SSL certificates generated successfully!"
