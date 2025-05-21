#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
wait-on -t 60000 tcp:postgres:5432

cd packages/database

# Check if this is a development environment
if [ "$NODE_ENV" = "development" ]; then
  echo "Development environment detected, resetting database..."
  # The -y flag is to skip confirmation prompts
  pnpm prisma migrate reset -f
else
  echo "Running migrations in production mode..."
  # Try to run migrations, if they fail due to existing schema, continue anyway
  pnpm prisma migrate deploy || true
fi

# Ensure Prisma client is generated
pnpm prisma generate

echo "Starting application..."
cd /app
node dist/main.js
