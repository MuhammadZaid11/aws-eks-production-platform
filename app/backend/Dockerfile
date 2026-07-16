# ---- Stage 1: Build & Install Dependencies ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies if they existed)
# Using clean install for deterministic builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# ---- Stage 2: Production Runtime ----
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backenduser

# Copy application code and installed node_modules from the builder stage
COPY --from=builder --chown=backenduser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backenduser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=backenduser:nodejs /app/server.js ./server.js
COPY --from=builder --chown=backenduser:nodejs /app/config ./config
COPY --from=builder --chown=backenduser:nodejs /app/models ./models
COPY --from=builder --chown=backenduser:nodejs /app/routes ./routes
COPY --from=builder --chown=backenduser:nodejs /app/middleware ./middleware

# Switch to non-root user
USER backenduser

# Expose API port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
