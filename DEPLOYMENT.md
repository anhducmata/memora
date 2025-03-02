# Deployment Guide

## Docker Deployment

### Local Development with Docker Compose

1. Create a `.env` file in the root directory with the required environment variables:
```env
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX=memories
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET=memora-media
FIREBASE_CONFIG=your_firebase_config_json
```

2. Build and start the services:
```bash
docker-compose up --build
```

The services will be available at:
- Frontend: http://localhost:80
- Backend: http://localhost:3000
- Neo4j Browser: http://localhost:7474

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (e.g., minikube, EKS, GKE, AKS)
- kubectl configured to access your cluster
- Container registry access

### Build and Push Docker Images

1. Build the images:
```bash
docker build -t your-registry/memora-frontend:latest ./frontend
docker build -t your-registry/memora-backend:latest ./backend
```

2. Push to your container registry:
```bash
docker push your-registry/memora-frontend:latest
docker push your-registry/memora-backend:latest
```

### Deploy to Kubernetes

1. Update image references in `k8s/frontend-deployment.yaml` and `k8s/backend-deployment.yaml`
2. Update the domain in `k8s/ingress.yaml`
3. Create the namespace and deploy resources:

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets (update values in secrets.yaml first)
kubectl apply -f k8s/secrets.yaml

# Apply ConfigMap
kubectl apply -f k8s/configmap.yaml

# Deploy Neo4j
kubectl apply -f k8s/neo4j-deployment.yaml

# Deploy Backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Apply Ingress
kubectl apply -f k8s/ingress.yaml
```

### Verify Deployment

```bash
kubectl get all -n memora
kubectl get ingress -n memora
```

### Scaling

To scale the frontend or backend:
```bash
kubectl scale deployment frontend -n memora --replicas=3
kubectl scale deployment backend -n memora --replicas=3
```

### Monitoring

Monitor the pods:
```bash
kubectl get pods -n memora -w
```

View logs:
```bash
kubectl logs -f deployment/frontend -n memora
kubectl logs -f deployment/backend -n memora
```

## Important Notes

1. Ensure all secrets are properly configured before deployment
2. Update the ingress host to match your domain
3. Configure SSL/TLS certificates for production use
4. Set up proper monitoring and logging
5. Configure appropriate resource limits based on your needs
6. Implement proper backup strategies for Neo4j data 