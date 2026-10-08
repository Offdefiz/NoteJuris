# Multi-stage build for lightweight, robust production container
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install all dependencies (including build tools)
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . ./

# Build frontend static bundle and compile server.js for production
RUN npm run build

# Remove development dependencies so node_modules is lightweight and production-ready
RUN npm prune --omit=dev

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only production dependencies and built artifacts from builder stage
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/.env.example ./.env.example

# Expose standard port
EXPOSE 3000

# Run native Node.js production server (fast, lightweight, no tsx overhead)
CMD ["node", "server.js"]
