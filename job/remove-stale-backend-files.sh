#!/usr/bin/env bash
# Run from the repository ROOT. Removes leftover real-estate files that break `nest build`.
set -e
STALE=(
  backend/src/modules/properties
  backend/src/modules/inquiries
  backend/src/database/entities/property.entity.ts
  backend/src/database/entities/inquiry.entity.ts
  backend/src/database/entities/favorite.entity.ts
)
for p in "${STALE[@]}"; do
  if [ -e "$p" ]; then
    git rm -r -f --quiet "$p" 2>/dev/null || rm -rf "$p"
    echo "removed $p"
  fi
done
echo; echo "Still referencing old code? (should print nothing):"
grep -rnE "PropertyStatus|PropertyType|ListingType|FurnishingType|InquiryStatus|PortalRole\.(SELLER|AGENT)|PropertiesModule|InquiriesModule" backend/src || true
echo; git status --short
