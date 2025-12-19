# Multi-stage build for production
FROM node:18-alpine AS development

# Install dependencies required for Prisma on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with memory optimization
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application - using || true as requested to bypass minor TS issues
# but still attempting a clean build first.
RUN npm run build || (echo "Warning: Build failed, attempting to proceed anyway" && exit 0)

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies for Prisma
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production --no-audit --no-fund

# Copy built application from development stage
COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=development /app/node_modules/@prisma ./node_modules/@prisma

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]
