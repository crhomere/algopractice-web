# OpenJDK 17 runtime for Java execution
FROM openjdk:17-jdk-slim

# Install security updates and basic utilities
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN useradd -m -u 1000 runner

# Set working directory
WORKDIR /app

# Copy the runner script
COPY java-runner.java /app/runner.java

# Compile the runner
RUN javac /app/runner.java

# Switch to non-root user
USER runner

# Default command
CMD ["java", "-cp", "/app", "runner"]