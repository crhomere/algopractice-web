# Node.js 20 runtime for JavaScript execution
FROM node:20-slim

# Install security updates
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN useradd -m -u 1001 runner

# Set working directory
WORKDIR /app

# Copy the runner script
COPY javascript-runner.js /app/runner.js

# Make runner executable
RUN chmod +x /app/runner.js

# Switch to non-root user
USER runner

# Default command
CMD ["node", "/app/runner.js"]