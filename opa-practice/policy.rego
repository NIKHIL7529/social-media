package image

deny if {
    endswith(input.image, ":latest")
}