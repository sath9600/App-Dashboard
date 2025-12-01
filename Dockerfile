# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Install SQLite3 and other system dependencies
RUN apk add --no-cache \
    sqlite \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files first for better caching
COPY backend/package*.json ./backend/
COPY backend/package-windows.json ./backend/

# Install dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Copy application files
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY database/ ./database/

# Create logs directory
RUN mkdir -p /app/logs

# Set proper permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 3000, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
        if (res.statusCode === 200) process.exit(0); \
        else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
WORKDIR /app/backend
CMD ["node", "server.js"]
