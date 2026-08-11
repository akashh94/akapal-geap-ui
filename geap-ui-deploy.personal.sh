#!/usr/bin/env bash

set -euo pipefail

# Deploy the UI to Cloud Run in the personal project (adk-tut-499512, us-central1),
# pointing at the supervisor engine deployed there.
export PROJECT_ID="${PROJECT_ID:-adk-tut-499512}"
export REGION="${REGION:-us-central1}"
export GEAP_ENGINE_ID="${GEAP_ENGINE_ID:-5062056426524901376}"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/akapal-geap-ui/akapal-geap-ui:$(git rev-parse --short HEAD)"

gcloud run deploy akapal-geap-ui \
    --image "$IMAGE" \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --min-instances 1 \
    --max-instances 1 \
    --set-env-vars "NODE_ENV=production,ETRADE_ENV=sandbox,GEAP_ENGINE_ID=${GEAP_ENGINE_ID},GEAP_ENGINE_PROJECT=${PROJECT_ID},GEAP_ENGINE_LOCATION=${REGION}"
