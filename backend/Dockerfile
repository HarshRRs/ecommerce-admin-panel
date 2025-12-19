# Build stage
FROM node:18-slim AS builder

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-slim AS production

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files for production install
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma Client for production
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]
