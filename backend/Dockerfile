# Build stage
FROM node:18-slim AS builder

# Install OpenSSL 3.0 (required for Prisma on newer Debian)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client (explicitly targeting engine for slim)
RUN npx prisma generate

# Build application - bypass errors as requested to ensure container creation
RUN npm run build || true

# Production stage
FROM node:18-slim AS production

# Install OpenSSL 3.0
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port (Koyeb setting should match this)
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]
