#!/usr/bin/env bash

set -euo pipefail

# For the demo build the checked out branch should be main, and for the beta checkout release/beta branch
git pull

export PROJECT_ID="labs-gcp-msls-16495-1782829337"
export REGION="us-east1"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/akapal-geap-ui/akapal-geap-ui:$(git rev-parse --short HEAD)"

echo "$IMAGE"

# Build with geap-ui/ as the context so Cloud Build uses geap-ui/Dockerfile
gcloud builds submit geap-ui/ --tag "$IMAGE" --project "$PROJECT_ID"
