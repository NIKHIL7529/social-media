# SocialSphere OPA Gatekeeper Policies

This directory is the production OPA/Gatekeeper policy source for Kubernetes admission control. `opa-practice/` is only for local learning and quick OPA experiments.

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

Update `allowedImagePrefixes` in `constraints/registry-constraint.yaml` before deploying to production. Replace `registry.example.com/` with your real registry prefix.

These policies intentionally target Pods, Deployments, DaemonSets, StatefulSets, Jobs, and CronJobs so the same baseline applies to app workloads and operational jobs.
