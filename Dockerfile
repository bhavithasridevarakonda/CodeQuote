# ==============================================================================
# CodeQuote Production Dockerfile
# Based on ultra-lightweight Nginx Alpine image (<25MB)
# Exposes Port 80 for Web Traffic and Kubernetes Health Probes
# ==============================================================================

FROM nginx:alpine

# Metadata labels for container governance & viva presentation
LABEL maintainer="student@college.edu" \
      app.name="codequote" \
      app.description="Developer inspiration website with full DevOps pipeline" \
      app.version="1.0.0"

# Remove default Nginx welcome assets
RUN rm -rf /usr/share/nginx/html/*

# Copy pure HTML, CSS, JavaScript, and health.html into the Nginx document root
COPY app/ /usr/share/nginx/html/

# Expose HTTP port 80
EXPOSE 80

# Start Nginx in the foreground so the container doesn't terminate
CMD ["nginx", "-g", "daemon off;"]
