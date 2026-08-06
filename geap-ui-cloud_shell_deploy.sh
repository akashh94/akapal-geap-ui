#!/usr/bin/env bash

set -eo pipefail

export PROJECT_ID="labs-gcp-msls-16495-1782829337"
export REGION="us-east1"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/akapal-geap-ui/akapal-geap-ui:$(git rev-parse --short HEAD)"

# Deploy as akapal-geap-ui on main (demo); use akapal-geap-ui-beta when on release/beta
# Agent Engine config is baked into server.js (GEAP_ENGINE_* constants).
gcloud run deploy akapal-geap-ui \
    --image "$IMAGE" \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --min-instances 1 \
    --max-instances 1 \
    --set-env-vars NODE_ENV=production,ETRADE_ENV=sandbox,GEAP_ENGINE_ID=1675708497288757248
