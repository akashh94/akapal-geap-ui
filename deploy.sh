#!/usr/bin/env bash

set -euo pipefail

# Resolve this project's root.
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Office environment config (self-contained): PROJECT_ID / REGION /
# ARTIFACT_REGISTRY / SERVICE_NAME / GEAP_ENGINE_* / ETRADE_ENV all come from
# deploy.office.env — the single source of truth for the office deployment.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy.office.env"

IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REGISTRY}/akapal-geap-ui:$(git rev-parse --short HEAD)"

gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE" \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --min-instances 1 \
    --max-instances 1 \
    --set-env-vars "NODE_ENV=production,ETRADE_ENV=${ETRADE_ENV},GEAP_ENGINE_ID=${GEAP_ENGINE_ID},GEAP_ENGINE_PROJECT=${GEAP_ENGINE_PROJECT},GEAP_ENGINE_LOCATION=${GEAP_ENGINE_LOCATION}"
