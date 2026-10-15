# OPA Local Policy Checks

`policy.rego` is a lightweight local practice policy for Kubernetes workloads. It accepts raw Kubernetes workload JSON, Kubernetes admission review shape, or Gatekeeper review shape.

This folder is for local learning and does not configure cluster admission. For cluster policies, see the [Gatekeeper README](../opa/README.md).

With the OPA CLI installed, run from the repository root:

```powershell
opa check opa-practice\policy.rego
opa eval -f pretty -d opa-practice\policy.rego -i opa-practice\fixtures\good-deployment.json "data.kubernetes.admission.deny"
opa eval -f pretty -d opa-practice\policy.rego -i opa-practice\fixtures\bad-deployment.json "data.kubernetes.admission.deny"
```

Expected behavior:

- `good-deployment.json` returns an empty set.
- `bad-deployment.json` returns violations for `latest`, missing probes, missing resources, privileged mode, host networking, hostPath, and missing hardening fields.
