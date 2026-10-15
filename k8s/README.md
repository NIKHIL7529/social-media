# Optional Kubernetes manifests

These files are deployment examples, not the current Vercel/Render deployment. Review and adapt them before cluster use; they are not a turnkey production configuration.

The manifests define FastAPI on port `8000` and the standalone Next.js server on `3000`. The repository-root `ingress.yaml` routes `/api` and `/ws` to the API and `/` to the web service; it expects an Nginx ingress controller.

## Required configuration

- Replace example image names, registry prefixes, hostname, and secret values. Build the web image with a valid absolute `NEXT_PUBLIC_API_URL` as described in the [frontend README](../apps/web/README.md#vercel-deployment); `/` is not a supported value.
- Review ConfigMaps against current application settings. An API-origin variable introduced only in container examples does not override the frontend's configured origin.
- Create `socialsphere-api-secret` using `api-secret.example.yaml` as a template. Application variable meanings and database prerequisites belong to the [API README](../apps/api/README.md).
- Keep the API at one replica and one worker because its realtime state is process-local. Do not enable the example API autoscaler without implementing shared realtime state.
- Review service accounts, RBAC, network policies, and ingress/WebSocket behavior for your cluster. Keep the namespace consistent across resources.

From the repository root, after adapting the examples:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f role.yaml
kubectl apply -f k8s/api-configmap.yaml -f k8s/web-configmap.yaml
kubectl apply -f path/to/your-api-secret.yaml
kubectl apply -f k8s/backend-deployment.yaml -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml -f k8s/frontend-service.yaml
kubectl apply -f network-policy.yaml -f ingress.yaml
```

Optional admission policies have their own [Gatekeeper instructions](../opa/README.md).
