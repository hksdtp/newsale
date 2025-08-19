# Base stage
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Development stage
FROM base AS development

# Expose port 3000
EXPOSE 3000

# Start development server with Docker-specific command
CMD ["npm", "run", "dev:docker"]

# Production stage
FROM base AS production

# Build the application
RUN npm run build

# Install nginx for serving static files
RUN apk add --no-cache nginx

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files to nginx directory
RUN cp -r dist/* /var/lib/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
