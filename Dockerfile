# Multi-stage build for lightweight production Docker image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install all dependencies
COPY package*.json ./
RUN npm install

# Copy application sources
COPY . ./

# Build client assets for production
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies + tsx for server
COPY package*.json ./
RUN npm install --omit=dev && npm install -g tsx

# Copy built frontend assets and server file
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/.env.example ./.env.example

# Expose standard port
EXPOSE 3000

# Start self-hosted full-stack application
CMD ["tsx", "server.ts"]
