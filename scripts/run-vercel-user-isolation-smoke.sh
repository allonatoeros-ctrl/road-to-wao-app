#!/bin/bash

# Real Vercel deployment URL (replace if your deployment URL is different)
VERCEL_APP_URL="https://road-to-wao-app.vercel.app"

# Configure real Supabase users
WAO_TEST_LUCA_EMAIL="luca.driver.demo@roadtowao.local"
WAO_TEST_SARA_EMAIL="sara.raver.demo@roadtowao.local"
WAO_TEST_ADMIN_EMAIL="allonatoeros@gmail.com"

echo "================================================================"
echo " Road to WAO - Vercel Read-Only User Isolation Smoke Test Runner"
echo "================================================================"
echo "Vercel URL: $VERCEL_APP_URL"
echo ""
echo "Please enter the passwords for the mock users (input is hidden):"

# Read passwords interactively and securely
read -s -p "Password Luca ($WAO_TEST_LUCA_EMAIL): " WAO_TEST_LUCA_PASSWORD
echo ""
read -s -p "Password Sara ($WAO_TEST_SARA_EMAIL): " WAO_TEST_SARA_PASSWORD
echo ""
read -s -p "Password Admin ($WAO_TEST_ADMIN_EMAIL): " WAO_TEST_ADMIN_PASSWORD
echo ""
echo "================================================================"

# Verify inputs
if [ -z "$WAO_TEST_LUCA_PASSWORD" ] || [ -z "$WAO_TEST_SARA_PASSWORD" ] || [ -z "$WAO_TEST_ADMIN_PASSWORD" ]; then
  echo "Error: All passwords are required to run the smoke test."
  exit 1
fi

echo "Running Playwright smoke test..."
echo ""

# Execute Playwright with exported environment variables limited only to the test run command execution
VERCEL_APP_URL="$VERCEL_APP_URL" \
WAO_TEST_LUCA_EMAIL="$WAO_TEST_LUCA_EMAIL" \
WAO_TEST_LUCA_PASSWORD="$WAO_TEST_LUCA_PASSWORD" \
WAO_TEST_SARA_EMAIL="$WAO_TEST_SARA_EMAIL" \
WAO_TEST_SARA_PASSWORD="$WAO_TEST_SARA_PASSWORD" \
WAO_TEST_ADMIN_EMAIL="$WAO_TEST_ADMIN_EMAIL" \
WAO_TEST_ADMIN_PASSWORD="$WAO_TEST_ADMIN_PASSWORD" \
npx playwright test tests/smoke/road-to-wao-vercel-user-isolation-real.spec.js \
  --reporter=line \
  --timeout=60000 \
  --output=/tmp/wao-vercel-user-isolation

echo ""
echo "Smoke test execution finished."
