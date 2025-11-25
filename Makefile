.PHONY: help build run stop clean logs test push

# Variables
IMAGE_NAME := datacanvas-front
CONTAINER_NAME := datacanvas-front
LOCAL_TAG := $(IMAGE_NAME):local
GHCR_REPO := ghcr.io/datacanvas-iot/datacanvas-front
PORT := 80

# Environment variables (override these as needed)
REACT_APP_API_URL ?= http://localhost:5000
REACT_APP_OPENAPI_KEY ?= your-key-here
REACT_APP_ANALYTICS_API_URL ?= http://localhost:5001

help: ## Show this help message
	@echo "DataCanvas-Front Docker Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image locally
	@echo "Building Docker image..."
	docker build \
		--build-arg REACT_APP_API_URL=$(REACT_APP_API_URL) \
		--build-arg REACT_APP_OPENAPI_KEY=$(REACT_APP_OPENAPI_KEY) \
		--build-arg REACT_APP_ANALYTICS_API_URL=$(REACT_APP_ANALYTICS_API_URL) \
		-t $(LOCAL_TAG) .
	@echo "Build complete: $(LOCAL_TAG)"

run: ## Run the container locally
	@echo "Starting container..."
	docker run -d \
		-p $(PORT):80 \
		--name $(CONTAINER_NAME) \
		--restart unless-stopped \
		$(LOCAL_TAG)
	@echo "Container started: http://localhost:$(PORT)"
	@echo "Health check: http://localhost:$(PORT)/health"

stop: ## Stop the running container
	@echo "Stopping container..."
	-docker stop $(CONTAINER_NAME)
	@echo "Container stopped"

clean: stop ## Stop and remove container and image
	@echo "Cleaning up..."
	-docker rm $(CONTAINER_NAME)
	-docker rmi $(LOCAL_TAG)
	@echo "Cleanup complete"

logs: ## View container logs
	docker logs -f $(CONTAINER_NAME)

test: ## Test the running container
	@echo "Testing health endpoint..."
	@curl -f http://localhost:$(PORT)/health && echo " ✓ Health check passed" || echo " ✗ Health check failed"
	@echo "Testing main page..."
	@curl -f -s http://localhost:$(PORT)/ > /dev/null && echo "✓ Main page accessible" || echo "✗ Main page not accessible"

shell: ## Open shell in running container
	docker exec -it $(CONTAINER_NAME) /bin/sh

inspect: ## Inspect the running container
	docker inspect $(CONTAINER_NAME)

pull: ## Pull latest image from GHCR
	docker pull $(GHCR_REPO):latest

push: ## Push local image to GHCR (requires authentication)
	docker tag $(LOCAL_TAG) $(GHCR_REPO):dev
	docker push $(GHCR_REPO):dev

restart: stop run ## Restart the container

rebuild: clean build run ## Rebuild and restart container

status: ## Check container status
	@docker ps -a | grep $(CONTAINER_NAME) || echo "Container not found"
	@echo ""
	@docker inspect $(CONTAINER_NAME) --format='Health Status: {{.State.Health.Status}}' 2>/dev/null || echo "Container not running"
