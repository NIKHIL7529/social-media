# OPA Local Policy Checks

`policy.rego` is a lightweight local practice policy for Kubernetes workloads. It accepts raw Kubernetes workload JSON, Kubernetes admission review shape, or Gatekeeper review shape.

Production Gatekeeper policy lives in `opa/`. Keep this folder for local learning, quick experiments, and fixture-based checks only.

Run local checks:

```powershell
opa check opa-practice\policy.rego
opa eval -f pretty -d opa-practice\policy.rego -i opa-practice\fixtures\good-deployment.json "data.kubernetes.admission.deny"
opa eval -f pretty -d opa-practice\policy.rego -i opa-practice\fixtures\bad-deployment.json "data.kubernetes.admission.deny"
```

Expected behavior:

- `good-deployment.json` returns an empty set.
- `bad-deployment.json` returns violations for `latest`, missing probes, missing resources, privileged mode, host networking, hostPath, and missing hardening fields.

Do not treat this folder as the source of truth for cluster admission policy.
