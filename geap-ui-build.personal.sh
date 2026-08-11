#!/usr/bin/env bash

set -euo pipefail

# Build + push the UI image to the personal project's Artifact Registry.
# Personal project: adk-tut-499512, us-central1 (US Central).
export PROJECT_ID="${PROJECT_ID:-adk-tut-499512}"
export REGION="${REGION:-us-central1}"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/akapal-geap-ui/akapal-geap-ui:$(git rev-parse --short HEAD)"

echo "$IMAGE"

# Build from the repo root so Cloud Build uses the root Dockerfile.
gcloud builds submit . --tag "$IMAGE" --project "$PROJECT_ID"
