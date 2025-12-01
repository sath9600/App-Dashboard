# Docker Deployment Guide - Questioner App

This guide provides comprehensive instructions for deploying the Questioner App using Docker containers, which solves compatibility issues and simplifies deployment across different platforms.

## Why Docker?

✅ **Eliminates SQLite3 compatibility issues**  
✅ **Consistent environment across platforms**  
✅ **Easy deployment and scaling**  
✅ **Isolated dependencies**  
✅ **Production-ready configuration**  

## Prerequisites

### System Requirements
- **Windows**: Windows 10/11 Pro, Enterprise, or Education (64-bit)
- **macOS**: macOS 10.14 or newer
- **Linux**: Any modern Linux distribution
- At least 4GB RAM
- 2GB free disk space

### Required Software
1. **Docker Desktop**
   - **Windows/macOS**: Download from https://docs.docker.com/desktop/
   - **Linux**: Install Docker Engine from https://docs.docker.com/engine/install/

2. **Docker Compose** (usually included with Docker Desktop)
   - Verify installation: `docker-compose --version`

## Quick Start

### Option 1: One-Click Deployment (Recommended)

#### Windows:
```batch
# Double-click or run in Command Prompt
docker-run.bat
```

#### Linux/macOS:
```bash
# Make script executable and run
chmod +x docker-run.sh
./docker-run.sh
```

### Option 2: Manual Docker Commands

```bash
# Build and start the application
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f questioner-app

# Stop the application
docker-compose down
```

## Deployment Options

### 1. Basic Deployment
```bash
# Start with default settings
docker-compose up -d
```
- **Access**: http://localhost:3000
- **Database**: Persistent SQLite storage
- **Logs**: Stored in `./logs` directory

### 2. Production Deployment with Nginx
```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d
```
- **Access**: http://localhost (port 80)
- **HTTPS**: http://localhost:443 (requires SSL certificates)
- **Load balancing**: Ready for multiple app instances

### 3. Development Mode
```bash
# Start with live reload (if configured)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Application settings
NODE_ENV=production
PORT=3000
APP_NAME=Questioner App

# Database settings
DB_PATH=/app/database/questioner.db

# Security settings
SESSION_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
```

### Custom Port Configuration
To run on a different port, modify `docker-compose.yml`:

```yaml
services:
  questioner-app:
    ports:
      - "8080:3000"  # External:Internal
```

### Volume Mounts
The application uses persistent volumes for:

- **Database**: `./database:/app/database`
- **Logs**: `./logs:/app/logs`

## Docker Commands Reference

### Container Management
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View running containers
docker-compose ps

# Remove containers and volumes
docker-compose down -v
```

### Logs and Debugging
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs questioner-app

# Execute commands in running container
docker-compose exec questioner-app sh
```

### Image Management
```bash
# Build images
docker-compose build

# Pull latest images
docker-compose pull

# Remove unused images
docker image prune

# View images
docker images
```

## Production Deployment

### 1. SSL/HTTPS Setup
Create SSL certificates and update `docker-compose.yml`:

```yaml
nginx:
  volumes:
    - ./ssl/cert.pem:/etc/nginx/ssl/cert.pem:ro
    - ./ssl/key.pem:/etc/nginx/ssl/key.pem:ro
```

### 2. Environment Security
```bash
# Use Docker secrets for sensitive data
echo "your-secret-key" | docker secret create session_secret -
```

### 3. Resource Limits
Add resource constraints to `docker-compose.yml`:

```yaml
services:
  questioner-app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 4. Health Checks
The application includes built-in health checks:
- **Endpoint**: http://localhost:3000/health
- **Interval**: 30 seconds
- **Timeout**: 10 seconds

## Scaling and Load Balancing

### Horizontal Scaling
```bash
# Scale to multiple instances
docker-compose up -d --scale questioner-app=3
```

### Load Balancer Configuration
Update `nginx.conf` for load balancing:

```nginx
upstream questioner_backend {
    server questioner-app:3000;
    server questioner-app_2:3000;
    server questioner-app_3:3000;
}
```

## Monitoring and Maintenance

### Container Health Monitoring
```bash
# Check container health
docker-compose ps

# View health check logs
docker inspect questioner-app --format='{{.State.Health.Status}}'
```

### Database Backup
```bash
# Create database backup
docker-compose exec questioner-app cp /app/database/questioner.db /app/database/backup_$(date +%Y%m%d_%H%M%S).db

# Copy backup to host
docker cp questioner-app:/app/database/backup_*.db ./backups/
```

### Log Rotation
Configure log rotation in `docker-compose.yml`:

```yaml
services:
  questioner-app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```
Error: bind: address already in use
```
**Solution**: Change the port mapping or stop conflicting services:
```bash
# Find process using port 3000
netstat -tulpn | grep :3000
# Kill the process or change port in docker-compose.yml
```

#### 2. Permission Denied
```
Error: permission denied while trying to connect to Docker daemon
```
**Solution**: Add user to docker group (Linux):
```bash
sudo usermod -aG docker $USER
# Logout and login again
```

#### 3. Container Won't Start
```bash
# Check logs for detailed error messages
docker-compose logs questioner-app

# Check container status
docker-compose ps

# Rebuild container
docker-compose build --no-cache questioner-app
```

#### 4. Database Issues
```bash
# Reset database (WARNING: This will delete all data)
docker-compose down -v
docker-compose up -d

# Or restore from backup
docker cp ./backup.db questioner-app:/app/database/questioner.db
docker-compose restart questioner-app
```

### Performance Optimization

#### 1. Image Size Optimization
The Dockerfile uses Alpine Linux for minimal size:
- **Base image**: node:18-alpine (~40MB)
- **Final image**: ~150MB (including dependencies)

#### 2. Build Cache Optimization
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build
```

#### 3. Multi-stage Builds
For even smaller production images, consider multi-stage builds in Dockerfile.

## Security Best Practices

### 1. Non-root User
The container runs as a non-root user (`node`) for security.

### 2. Read-only Filesystem
Add read-only filesystem for enhanced security:

```yaml
services:
  questioner-app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/logs
```

### 3. Network Security
```yaml
networks:
  questioner-network:
    driver: bridge
    internal: true  # Isolate from external networks
```

### 4. Secrets Management
Use Docker secrets for sensitive configuration:

```yaml
secrets:
  session_key:
    file: ./secrets/session_key.txt

services:
  questioner-app:
    secrets:
      - session_key
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          docker-compose pull
          docker-compose up -d --remove-orphans
```

### Automated Backups
```bash
# Add to crontab for daily backups
0 2 * * * cd /path/to/app && docker-compose exec -T questioner-app cp /app/database/questioner.db /app/database/backup_$(date +\%Y\%m\%d).db
```

## Migration from Native Installation

### 1. Export Existing Data
```bash
# Copy existing database
cp ./database/questioner.db ./database/questioner_backup.db
```

### 2. Deploy Docker Version
```bash
# Deploy with existing data
docker-compose up -d
```

### 3. Verify Migration
```bash
# Check application health
curl http://localhost:3000/health

# Verify data integrity
docker-compose exec questioner-app sqlite3 /app/database/questioner.db "SELECT COUNT(*) FROM questions;"
```

## Support and Updates

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d
```

### Getting Help
- **Application logs**: `docker-compose logs questioner-app`
- **Container status**: `docker-compose ps`
- **Health check**: `curl http://localhost:3000/health`

---

**Docker deployment eliminates compatibility issues and provides a consistent, production-ready environment for the Questioner App across all platforms.**
