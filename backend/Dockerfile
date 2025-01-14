FROM node:20-alpine

# Create app directory
WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source files
COPY server.js ./
COPY db ./db
COPY scripts ./scripts

# Set Docker environment variable
ENV DOCKER_CONTAINER=true

# Change ownership of the app files to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Start the application
CMD ["node", "server.js"]
