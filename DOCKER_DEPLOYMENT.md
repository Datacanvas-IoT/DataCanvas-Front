# Docker Deployment Guide for DataCanvas-Front

## Overview
This guide covers deploying DataCanvas-Front as a Docker container to GitHub Container Registry (GHCR).

## Files Created
- `Dockerfile` - Multi-stage Docker build configuration
- `.dockerignore` - Files to exclude from Docker build context
- `nginx.conf` - Nginx configuration for serving the React app
- `.github/workflows/docker-publish.yml` - GitHub Actions workflow for automated builds

## Prerequisites
### 1. GitHub Repository Setup
Ensure your repository is hosted on GitHub with the following structure:
- Owner: `Datacanvas-IoT`
- Repository: `DataCanvas-Front`

### 2. GitHub Secrets Configuration
Configure the following secrets in your GitHub repository:
1. Go to: Settings → Secrets and variables → Actions → New repository secret

Add these secrets:
- `REACT_APP_API_URL` - Your backend API URL
- `REACT_APP_OPENAPI_KEY` - Your OpenAI API key
- `REACT_APP_ANALYTICS_API_URL` - Your analytics API URL

**Note:** `GH_TOKEN` is automatically provided by GitHub Actions.

### 3. GitHub Packages Permissions
Enable GitHub Actions to write packages:
1. Go to: Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"

## Local Docker Build and Test

### Build the image:
```bash
cd /home/user/Projects/DataCanvas-Front

docker build \
  --build-arg REACT_APP_API_URL="http://localhost:5000" \
  --build-arg REACT_APP_OPENAPI_KEY="your-key-here" \
  --build-arg REACT_APP_ANALYTICS_API_URL="http://localhost:5001" \
  -t datacanvas-front:local .
```

### Run the container:
```bash
docker run -d \
  -p 80:80 \
  --name datacanvas-front \
  datacanvas-front:local
```

### Test the deployment:
```bash
curl http://localhost/health
# Should return: healthy
```

### View logs:
```bash
docker logs datacanvas-front
```

### Stop and remove:
```bash
docker stop datacanvas-front
docker rm datacanvas-front
```

## Automated Deployment via GitHub Actions

The workflow automatically triggers on:
- **Push to `main` or `develop` branches** - Builds and pushes with branch name tag
- **Push tags** starting with `v` (e.g., `v1.0.0`) - Creates version tags
- **Pull requests to `main`** - Builds but doesn't push (validation only)
- **Manual trigger** - Via GitHub Actions UI

### Automatic Tagging Strategy
The workflow creates multiple tags for each build:
- `latest` - For main branch builds
- `main`, `develop` - Branch-based tags
- `v1.0.0`, `v1.0`, `v1` - Semantic version tags
- `main-abc1234` - Branch + commit SHA

### Trigger a deployment:

#### 1. Push to main branch:
```bash
git add .
git commit -m "Deploy DataCanvas-Front"
git push origin main
```

#### 2. Create a version tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### 3. Manual trigger:
1. Go to: Actions → Build and Push Docker Image to GHCR
2. Click "Run workflow"
3. Select branch and click "Run workflow"

## Pulling and Running the Image

### Authenticate with GHCR:
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### Pull the image:
```bash
docker pull ghcr.io/datacanvas-iot/datacanvas-front:latest
```

### Run the pulled image:
```bash
docker run -d \
  -p 80:80 \
  --name datacanvas-front \
  ghcr.io/datacanvas-iot/datacanvas-front:latest
```

## Production Deployment

### Using Docker Compose:
Create a `docker-compose.yml`:
```yaml
version: '3.8'

services:
  frontend:
    image: ghcr.io/datacanvas-iot/datacanvas-front:latest
    ports:
      - "80:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

### Deploy:
```bash
docker-compose up -d
```

## Monitoring and Maintenance

### Check container health:
```bash
docker ps
docker inspect datacanvas-front --format='{{.State.Health.Status}}'
```

### View application logs:
```bash
docker logs -f datacanvas-front
```

### Update to latest version:
```bash
docker pull ghcr.io/datacanvas-iot/datacanvas-front:latest
docker stop datacanvas-front
docker rm datacanvas-front
docker run -d -p 80:80 --name datacanvas-front ghcr.io/datacanvas-iot/datacanvas-front:latest
```

## Image Visibility

By default, GHCR packages are private. To make the image public:
1. Go to: https://github.com/orgs/Datacanvas-IoT/packages
2. Find your package
3. Click "Package settings"
4. Scroll to "Danger Zone"
5. Click "Change visibility" → "Public"

## Troubleshooting

### Build fails in GitHub Actions:
- Check that repository secrets are configured correctly
- Verify workflow permissions are set to "Read and write"
- Review workflow logs in the Actions tab

### Container won't start:
- Check logs: `docker logs datacanvas-front`
- Verify port 80 is not already in use
- Ensure build arguments were provided correctly

### Health check failing:
- Verify nginx is running: `docker exec datacanvas-front ps aux`
- Check nginx config: `docker exec datacanvas-front nginx -t`
- Test health endpoint: `curl http://localhost/health`