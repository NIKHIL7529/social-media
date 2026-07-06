package kubernetes.admission

import rego.v1

workload := input.request.object

pod_spec := workload.spec if {
	workload.kind == "Pod"
}

pod_spec := workload.spec.template.spec if {
	workload.kind != "Pod"
}

containers contains container if {
	container := pod_spec.containers[_]
}

containers contains container if {
	container := pod_spec.initContainers[_]
}

deny contains "images must use immutable, non-latest tags" if {
	input.image
	endswith(input.image, ":latest")
}

deny contains sprintf("%s image must not use the latest tag", [container.name]) if {
	container := containers[_]
	endswith(container.image, ":latest")
}

deny contains sprintf("%s must define CPU and memory requests", [container.name]) if {
	container := containers[_]
	not container.resources.requests.cpu
}

deny contains sprintf("%s must define CPU and memory requests", [container.name]) if {
	container := containers[_]
	not container.resources.requests.memory
}

deny contains sprintf("%s must define CPU and memory limits", [container.name]) if {
	container := containers[_]
	not container.resources.limits.cpu
}

deny contains sprintf("%s must define CPU and memory limits", [container.name]) if {
	container := containers[_]
	not container.resources.limits.memory
}

deny contains sprintf("%s must define readiness and liveness probes", [container.name]) if {
	container := containers[_]
	not container.readinessProbe
}

deny contains sprintf("%s must define readiness and liveness probes", [container.name]) if {
	container := containers[_]
	not container.livenessProbe
}

deny contains sprintf("%s must run as non-root", [container.name]) if {
	container := containers[_]
	container.securityContext.runAsNonRoot != true
}

deny contains sprintf("%s must not allow privilege escalation", [container.name]) if {
	container := containers[_]
	container.securityContext.allowPrivilegeEscalation != false
}

deny contains sprintf("%s must not run privileged", [container.name]) if {
	container := containers[_]
	container.securityContext.privileged == true
}

deny contains sprintf("%s must drop all Linux capabilities", [container.name]) if {
	container := containers[_]
	not drops_all_capabilities(container)
}

deny contains sprintf("%s must use a read-only root filesystem", [container.name]) if {
	container := containers[_]
	container.securityContext.readOnlyRootFilesystem != true
}

deny contains "pods must not use host networking" if {
	pod_spec.hostNetwork == true
}

deny contains "pods must not use host PID namespace" if {
	pod_spec.hostPID == true
}

deny contains "pods must not use host IPC namespace" if {
	pod_spec.hostIPC == true
}

deny contains "pods must not mount hostPath volumes" if {
	volume := pod_spec.volumes[_]
	volume.hostPath
}

drops_all_capabilities(container) if {
	container.securityContext.capabilities.drop[_] == "ALL"
}
