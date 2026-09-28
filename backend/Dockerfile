# Production Dockerfile for TeenSpend Backend
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]
