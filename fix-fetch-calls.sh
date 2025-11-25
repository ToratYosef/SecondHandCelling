#!/bin/bash

# Script to fix all fetch calls to use getApiUrl

# List of files to fix
files=(
  "client/src/pages/Success.tsx"
  "client/src/pages/QuoteBuilder.tsx"
  "client/src/pages/Track.tsx"
  "client/src/pages/admin/Devices.tsx"
  "client/src/pages/admin/Settings.tsx"
  "client/src/pages/admin/Orders.tsx"
  "client/src/pages/admin/Pricing.tsx"
  "client/src/pages/admin/Email.tsx"
  "client/src/pages/admin/Clicks.tsx"
  "client/src/pages/admin/DashboardNew.tsx"
  "client/src/pages/admin/Aging.tsx"
  "client/src/pages/admin/Dashboard.tsx"
  "client/src/pages/admin/PrintQueue.tsx"
  "client/src/pages/admin/Analytics.tsx"
  "client/src/components/InstantQuoteWidget.tsx"
  "client/src/components/AdminLayout.tsx"
  "client/src/components/AdminProtected.tsx"
)

echo "Fixing fetch calls to use getApiUrl..."

for file in "${files[@]}"; do
  if [ -f "/workspaces/SecondHandCelling/$file" ]; then
    echo "Processing $file..."
    
    # Check if file already has the import
    if ! grep -q "import.*getApiUrl.*from.*@/lib/api" "/workspaces/SecondHandCelling/$file"; then
      # Add import after other imports
      sed -i '/^import/a import { getApiUrl } from "@/lib/api";' "/workspaces/SecondHandCelling/$file"
      # Remove duplicate if it was added multiple times
      awk '!seen[$0]++' "/workspaces/SecondHandCelling/$file" > "/tmp/tmpfile" && mv "/tmp/tmpfile" "/workspaces/SecondHandCelling/$file"
    fi
    
    # Replace fetch("/api/ with fetch(getApiUrl("/api/
    sed -i 's/fetch("\(\/api\/[^"]*\)")/fetch(getApiUrl("\1"))/g' "/workspaces/SecondHandCelling/$file"
    
    # Replace fetch(`/api/ with fetch(getApiUrl(`/api/
    sed -i 's/fetch(`\(\/api\/[^`]*\)`)/fetch(getApiUrl(`\1`))/g' "/workspaces/SecondHandCelling/$file"
    
    echo "  ✓ Fixed $file"
  else
    echo "  ⚠ File not found: $file"
  fi
done

echo ""
echo "Done! All fetch calls have been updated."
