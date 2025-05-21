# Docker Configuration for School Admin Dashboard

This directory contains all Docker-related configuration for the School Admin Dashboard project.

## Structure

```
docker/
├── backend/            # Backend service Docker files
│   ├── Dockerfile     # Backend Dockerfile 
│   └── docker-entrypoint.sh  # Backend container startup script
├── docker-compose.yml # Main Docker Compose configuration
├── .env               # Environment variables (not in version control)
├── .env.example      # Example environment variables
└── README.md         # This file
```

## Quick Start

```bash
# 1. Navigate to the docker directory
cd /path/to/school-admin-dashboard/docker

# 2. Set up environment variables (first time only)
cp .env.example .env

# 3. Create data directories (first time only)
mkdir -p ../data/postgres ../backups/postgres

# 4. Build and start the services
docker-compose up -d

We provide a `Makefile` with useful commands for common tasks:

| Command | Description |
|---------|-------------|
| `make up` | Start all services in detached mode |
| `make down` | Stop and remove all containers |
| `make build` | Rebuild the backend service |
| `make logs` | View logs for all services |
| `make logs-backend` | View backend logs |
| `make logs-db` | View database logs |
| `make ps` | View container status |
| `make restart` | Restart all services |
| `make clean` | Stop and remove all containers and volumes |
| `make migrate` | Run database migrations |
| `make shell` | Open a shell in the backend container |
| `make health` | Check backend health status |
| `make list` | List running containers |

## Health Checks

The backend service includes a health check that verifies the application is running and responsive. The health check runs every 10 seconds and will automatically restart the container if it fails 3 times in a row.

You can manually check the health status using:
```bash
make health
```

## Detailed Setup Instructions

### 1. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and configure your environment variables:
   ```bash
   # Edit the .env file with your preferred editor
   nano .env
   ```
   
   Key settings to review:
   - `POSTGRES_USER` and `POSTGRES_PASSWORD`: Database credentials
   - `POSTGRES_DB`: Database name (default: school_admin_db)
   - `JWT_SECRET`: Used for authentication tokens (change for production)
   - `POSTGRES_CONTAINER_NAME`: Container name for the database service
   - `BACKEND_CONTAINER_NAME`: Container name for the backend service

### 2. Data Persistence

Create required directories for data persistence:
```bash
mkdir -p ../data/postgres ../backups/postgres
```

### 3. Building and Starting the Services

**Development Mode (with schema reset):**

The docker-compose.yml is configured for development by default, which resets the database schema on startup.

```bash
# Build the services
docker-compose build

# Start the services in the background
docker-compose up -d
```

**Production Mode (without schema reset):**

To run in production mode (preserves data), modify the NODE_ENV in docker-compose.yml:

```yaml
environment:
  NODE_ENV: production  # Change from 'development' to 'production'
```

### 4. Verify Services Are Running

Check that containers are running properly:
```bash
docker-compose ps
```

View logs for specific services:
```bash
# View backend logs
docker-compose logs backend

# Follow backend logs in real-time
docker-compose logs -f backend
```

Test the API health endpoint:
```bash
curl http://localhost:3000/health
```

### 5. Stopping the Services

```bash
# Stop services but keep volumes
docker-compose down

# Stop services and remove volumes (will delete database data)
docker-compose down -v
```

## Available Services

### PostgreSQL Database

- **Service Name**: postgres
- **Default Port**: 5432 (configurable in .env)
- **Configuration**: Performance tuning variables available in .env file
- **Data Directory**: Stored in ../data/postgres (configurable)
- **Backup Directory**: ../backups/postgres (configurable)
- **Default Credentials**: Username: school_admin, Password: admin123 (change in .env)

### Backend API

- **Service Name**: backend
- **Default Port**: 3000 (configurable in .env)
- **Health Check Endpoint**: /health
- **Environment Variables**: See .env.example for available options
- **API Documentation**: SwaggerUI available at http://localhost:3000/api (if enabled)

## Maintenance

### Database Backups

Backups are stored in the configured backup directory. Run a manual backup:

```bash
# Create a timestamped backup
docker exec school-admin-db pg_dump -U school_admin school_admin_db > ../backups/postgres/backup_$(date +%Y%m%d_%H%M%S).sql
```

Set up automatic backups with a cron job:
```bash
# Edit crontab to add a daily backup at 3am
crontab -e

# Add this line and save (adjust the path):
0 3 * * * cd /path/to/school-admin-dashboard/docker && docker exec school-admin-db pg_dump -U school_admin school_admin_db > ../backups/postgres/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Updating Services After Code Changes

```bash
# Rebuild and restart services
docker-compose build --no-cache
docker-compose up -d
```

### Database Management

Connect to the database directly:
```bash
docker exec -it school-admin-db psql -U school_admin -d school_admin_db
```

Reset the database completely (warning: destroys all data):
```bash
# Stop services first
docker-compose down

# Remove existing database files
rm -rf ../data/postgres/*

# Start services again
docker-compose up -d
```

## Troubleshooting

### Common Issues and Solutions

1. **Permission denied errors**:
   ```bash
   sudo chown -R $(whoami) ../data ../backups
   ```

2. **Port conflicts**:
   If ports 3000 or 5432 are already in use, edit .env to use different ports

3. **Database connection issues**:
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # View PostgreSQL logs
   docker-compose logs postgres
   ```

4. **Container fails to start**:
   ```bash
   # View details of the container
   docker inspect school-admin-backend
   
   # View startup logs
   docker-compose logs backend
   ```

## Notes

- The backend container runs migrations automatically on startup
- In development mode, the database schema is reset on container startup
- In production mode, migrations are applied without resetting data
- Database performance settings are optimized for development by default
- For production deployment, consider improving security settings:
  - Change all default passwords
  - Configure proper JWT secrets
  - Consider using Docker Swarm or Kubernetes for orchestration
