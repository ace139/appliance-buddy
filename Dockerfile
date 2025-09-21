# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY appliance-buddy-backend/package*.json ./appliance-buddy-backend/

# Install backend dependencies
WORKDIR /app/appliance-buddy-backend
RUN npm ci --only=production

# Copy backend source code
COPY appliance-buddy-backend/ ./

# Build the backend
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]