# SocialSphere OPA Gatekeeper Policies

Optional OPA/Gatekeeper admission policies for the [Kubernetes examples](../k8s/README.md). Gatekeeper must already be installed in the target cluster. These policies are not used by the Vercel/Render deployment.

## Structure

```text
opa/
  templates/    # Gatekeeper ConstraintTemplate definitions
  constraints/  # Gatekeeper Constraint instances
```

## Policies

| Template | Constraint | Purpose |
| :--- | :--- | :--- |
| `image-tag-template.yaml` | `image-tag-constraint.yaml` | Require explicit image tags or digests and reject `latest`. |
| `registry-template.yaml` | `registry-constraint.yaml` | Restrict images to approved registry/prefix values. |
| `limits-template.yaml` | `limits-constraint.yaml` | Require CPU/memory requests and limits. |
| `probe-template.yaml` | `probe-constraint.yaml` | Require readiness and liveness probes. |
| `runasnonroot-template.yaml` | `runasnonroot-constraint.yaml` | Require containers to run as non-root. |
| `privileged-template.yaml` | `privileged-constraint.yaml` | Block privileged containers and privilege escalation. |
| `security-context-template.yaml` | `security-context-constraint.yaml` | Require read-only root filesystems, dropped Linux capabilities, and block host namespace/hostPath usage. |

## Apply

```powershell
kubectl apply -f opa\templates
kubectl apply -f opa\constraints
```

Update `allowedImagePrefixes` in `constraints/registry-constraint.yaml` before applying the constraints. Replace `registry.example.com/` with your real registry prefix. Run the commands above from the repository root, applying templates before constraints.

These policies intentionally target Pods, Deployments, DaemonSets, StatefulSets, Jobs, and CronJobs so the same baseline applies to app workloads and operational jobs.
