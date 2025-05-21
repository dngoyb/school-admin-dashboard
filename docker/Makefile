.PHONY: up down build logs ps restart clean

# Start all services in detached mode
up:
	docker-compose up -d

# Stop and remove all containers
down:
	docker-compose down

# Rebuild the backend service
build:
	docker-compose build backend

# View logs for all services
logs:
	docker-compose logs -f

# View container status
ps:
	docker-compose ps

# Restart all services
restart:
	docker-compose restart

# Stop and remove all containers and volumes
clean:
	docker-compose down -v

# View backend logs
logs-backend:
	docker-compose logs -f backend

# View database logs
logs-db:
	docker-compose logs -f postgres

# Run database migrations
migrate:
	docker-compose exec backend npx prisma migrate deploy

# Open a shell in the backend container
shell:
	docker-compose exec backend sh

# View the health status of services
health:
	@echo "=== Backend Health Check ==="
	@curl -s http://localhost:3000/health | jq . || echo "Backend is not running or health check endpoint is not available"

# List running containers
list:
	docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"
