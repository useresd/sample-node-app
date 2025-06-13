# Sample Node.js App for Kubernetes

A simple Express.js application designed for Kubernetes deployment with health checks and pod information endpoints.

## Features

- **Pod Information Display**: Shows detailed information about the current pod
- **Health Check Endpoints**: Provides `/health`, `/ready`, and `/live` endpoints for Kubernetes probes
- **Environment Variable Support**: Port configuration via `PORT` environment variable (defaults to 8080)
- **Kubernetes Integration**: Displays Kubernetes pod metadata when available
- **Graceful Shutdown**: Handles SIGTERM and SIGINT signals properly

## Endpoints

- `GET /` - Main endpoint showing pod information and available endpoints
- `GET /health` - Health check endpoint
- `GET /ready` - Readiness probe endpoint
- `GET /live` - Liveness probe endpoint  
- `GET /info` - Detailed system and pod information

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start the application
npm start

# Or use nodemon for development
npm run dev
```

The application will start on port 8080 by default, or on the port specified by the `PORT` environment variable.

### Docker

```bash
# Build the Docker image
docker build -t sample-node-app .

# Run the container
docker run -p 8080:8080 sample-node-app
```

### Kubernetes Deployment

```bash
# Apply the Kubernetes manifests
kubectl apply -f kubernetes/

# Check the deployment
kubectl get pods
kubectl get services
```

## Environment Variables

- `PORT` - Port number (default: 8080)
- `NODE_ENV` - Node environment (default: development)
- `POD_NAME` - Kubernetes pod name
- `POD_NAMESPACE` - Kubernetes pod namespace
- `POD_IP` - Kubernetes pod IP
- `NODE_NAME` - Kubernetes node name
- `SERVICE_ACCOUNT` - Kubernetes service account

## Health Checks

The application provides three health check endpoints suitable for Kubernetes:

- `/health` - Basic health check
- `/ready` - Readiness probe (checks if app is ready to receive traffic)
- `/live` - Liveness probe (checks if app is still alive and functioning)

## API Response Format

All endpoints return JSON responses with consistent structure including:
- Status information
- Timestamp
- Hostname
- Relevant data for each endpoint

Example response from `/`:
```json
{
  "message": "Welcome to Sample Node.js App for Kubernetes!",
  "status": "running",
  "pod": {
    "hostname": "sample-app-5d6f8b9c4d-xyz12",
    "platform": "linux",
    "arch": "x64",
    "nodeVersion": "v18.17.0",
    "uptime": 123.45,
    "memory": {...},
    "env": {...},
    "timestamp": "2025-06-13T10:30:00.000Z"
  },
  "endpoints": {
    "health": "/health",
    "ready": "/ready", 
    "live": "/live",
    "info": "/"
  }
}
```
