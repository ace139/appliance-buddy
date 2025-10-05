# Use Node.js 20 LTS version (required for better-sqlite3)
FROM node:20-alpine

# Install Python and build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite-dev

# Set working directory
WORKDIR /app

# Copy package manifests for workspaces
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

# Enable pnpm and install dependencies for all workspaces
RUN corepack enable \
  && corepack prepare pnpm@9.12.3 --activate \
  && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the API workspace
RUN pnpm --filter appliance-buddy-api run build

# Expose port
EXPOSE 3000

# Health check
# Move into the API workspace for runtime commands
WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["pnpm", "start"]