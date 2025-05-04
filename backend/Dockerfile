# Use Node.js LTS (Long Term Support) version
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies for node-gyp and other native modules
RUN apk add --no-cache python3 make g++ git curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create volume for logs
VOLUME [ "/usr/src/app/logs" ]

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/dev/health || exit 1

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
