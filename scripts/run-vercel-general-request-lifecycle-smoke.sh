#!/bin/bash
# scripts/run-vercel-general-request-lifecycle-smoke.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Hardcode VERCEL_APP_URL
export VERCEL_APP_URL="https://road-to-wao-app.vercel.app"
export PLAYWRIGHT_BASE_URL="$VERCEL_APP_URL"

# Hardcode emails
export SARA_EMAIL="sara.raver.demo@roadtowao.local"
export ADMIN_EMAIL="allonatoeros@gmail.com"

# Securely prompt for passwords
echo "=== Road to WAO - Vercel General Request Lifecycle Smoke Test Runner ==="
echo "Please enter passwords for the accounts (input will be hidden):"
echo -n "Password for Sara ($SARA_EMAIL): "
read -s SARA_PASSWORD
echo
echo -n "Password for Admin ($ADMIN_EMAIL): "
read -s ADMIN_PASSWORD
echo
echo "=========================================================="

export SARA_PASSWORD
export ADMIN_PASSWORD

echo "Starting Playwright smoke test..."

# Run only the specified test command
npx playwright test tests/smoke/road-to-wao-vercel-general-request-lifecycle-real.spec.js --reporter=line --timeout=120000 --output=/tmp/wao-vercel-general-request-lifecycle
