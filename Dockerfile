# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Build arguments for environment variables
ARG REACT_APP_API_URL
ARG REACT_APP_OPENAPI_KEY
ARG REACT_APP_ANALYTICS_API_URL

# Set environment variables from build args
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_OPENAPI_KEY=$REACT_APP_OPENAPI_KEY
ENV REACT_APP_ANALYTICS_API_URL=$REACT_APP_ANALYTICS_API_URL

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install serve to serve static files
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/build ./build

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application with serve
CMD ["serve", "-s", "build", "-l", "3000"]
