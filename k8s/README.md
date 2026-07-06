# Kubernetes Deployment Notes

These manifests deploy the current SocialSphere stack as two application workloads:

- `socialsphere-api` runs FastAPI/Uvicorn on port `8000`.
- `socialsphere-web` runs the Next.js standalone server on port `3000`.

`ingress.yaml` routes `/api` and `/ws` to the API service and `/` to the web service. WebSocket upgrade handling is expected from the Nginx ingress controller.

Before applying to a real cluster:

1. Build and push `socialsphere-api:0.1.0` and `socialsphere-web:0.1.0`, or replace the image names with your registry paths.
2. For same-origin ingress routing, build the web image with `NEXT_PUBLIC_API_URL=/`.
3. Create a real `socialsphere-api-secret` from `api-secret.example.yaml` with production MongoDB, JWT, and Cloudinary values.
4. Update `social.local` in `ingress.yaml`, `FRONTEND_URL`, and `FRONTEND_URLS` to your production host.

Recommended apply order:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f role.yaml
kubectl apply -f k8s/api-configmap.yaml -f k8s/web-configmap.yaml
kubectl apply -f path\to\your-api-secret.yaml
kubectl apply -f k8s/backend-deployment.yaml -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml -f k8s/frontend-service.yaml
kubectl apply -f network-policy.yaml -f ingress.yaml
```
