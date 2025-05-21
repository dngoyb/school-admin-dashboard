# Stage 1: Builder
FROM node:20-alpine AS builder

# Install pnpm and required build tools
RUN apk add --no-cache git python3 make g++ && \
    npm install -g pnpm@10

WORKDIR /app

# Copy only the files needed for dependency installation
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies (including devDependencies)
RUN pnpm install --force

# Copy remaining source files
COPY . .

# Build the database package first
RUN cd packages/database && \
    pnpm install && \
    pnpm prisma generate && \
    pnpm build && \
    cd ../..

# Ensure Prisma client is generated for production
RUN cd packages/database && \
    pnpm prisma generate && \
    cd ../..

# Build the backend application
RUN pnpm --filter @school-admin/backend build

# Stage 2: Production
FROM node:20-alpine

# Install OpenSSL for Prisma and other dependencies
RUN apk add --no-cache openssl postgresql-client

# Create non-root user for security
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    mkdir -p /app && \
    chown appuser:appgroup /app

WORKDIR /app

# Install pnpm (production only)
RUN npm install -g pnpm@10

# Copy built assets from builder
COPY --from=builder --chown=appuser:appgroup /app/apps/backend/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/apps/backend/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/packages/database ./packages/database
COPY --from=builder --chown=appuser:appgroup /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --force --filter @school-admin/backend && \
    pnpm install --prod --force --filter @school-admin/database && \
    cd packages/database && \
    pnpm add -D prisma && \
    npm i -g wait-on && \
    pnpm prisma generate && \
    cd ../.. && \
    # Fix permissions for the non-root user
    chown -R appuser:appgroup /app

# Environment variables
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost:3000/api/health || exit 1

# Expose the port the app runs on
EXPOSE 3000

# Run as non-root user
USER appuser

# Add startup script
COPY --chown=appuser:appgroup docker/backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Start the application
CMD ["/app/docker-entrypoint.sh"]