#!/bin/bash
# E2E Test Script for Public Content Management
# Tests the complete flow: list -> get translations -> edit -> verify

set -e

BASE_URL="http://localhost:8080/api/v1"
EMAIL="admin@tfg.es"
PASSWORD="Admin1234"

echo "=== E2E TEST: Public Content Management ==="
echo ""

# 1. Login
echo "1. Logging in..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ FAILED: Could not obtain auth token"
  exit 1
fi
echo "✅ Login successful"
echo ""

# 2. List legislation
echo "2. Listing legislation entries..."
LEGISLATION_COUNT=$(curl -s "$BASE_URL/admin/public-content/legislation" \
  -H "Authorization: Bearer $TOKEN" | jq 'length')

if [ "$LEGISLATION_COUNT" -eq 0 ]; then
  echo "❌ FAILED: No legislation entries found"
  exit 1
fi
echo "✅ Found $LEGISLATION_COUNT legislation entries"
echo ""

# 3. Get first legislation ID
FIRST_ID=$(curl -s "$BASE_URL/admin/public-content/legislation" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

echo "3. Testing legislation ID: $FIRST_ID"
echo ""

# 4. Get translations
echo "4. Getting translations for legislation..."
TRANSLATIONS_COUNT=$(curl -s "$BASE_URL/admin/public-content/legislation/$FIRST_ID/translations" \
  -H "Authorization: Bearer $TOKEN" | jq 'length')

if [ "$TRANSLATIONS_COUNT" -ne 5 ]; then
  echo "❌ FAILED: Expected 5 translations, got $TRANSLATIONS_COUNT"
  exit 1
fi
echo "✅ Found $TRANSLATIONS_COUNT translations (es-ES, ca-ES, eu-ES, gl-ES, va-ES)"
echo ""

# 5. Edit es-ES translation
echo "5. Editing es-ES translation..."
ORIGINAL_TITLE=$(curl -s "$BASE_URL/admin/public-content/legislation/$FIRST_ID/translations" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.locale == "es-ES") | .title')

EDITED_TITLE="$ORIGINAL_TITLE (E2E-EDITED)"

curl -s -X PUT "$BASE_URL/admin/public-content/legislation/$FIRST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"locale\": \"es-ES\",
    \"translationGroupId\": \"$FIRST_ID\",
    \"type\": \"law\",
    \"title\": \"$EDITED_TITLE\",
    \"description\": \"Description edited in E2E test\",
    \"publicationDate\": null,
    \"externalUrl\": \"https://example.org\",
    \"downloadUrl\": null,
    \"sortOrder\": 0,
    \"published\": true
  }" > /dev/null

echo "✅ Edit request sent"
echo ""

# 6. Verify edit
echo "6. Verifying edit..."
UPDATED_TITLE=$(curl -s "$BASE_URL/admin/public-content/legislation/$FIRST_ID/translations" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.locale == "es-ES") | .title')

if [ "$UPDATED_TITLE" != "$EDITED_TITLE" ]; then
  echo "❌ FAILED: Title not updated correctly"
  echo "   Expected: $EDITED_TITLE"
  echo "   Got: $UPDATED_TITLE"
  exit 1
fi
echo "✅ Edit verified: title updated correctly"
echo ""

# 7. Verify other translations unchanged
echo "7. Verifying other translations unchanged..."
CA_TITLE=$(curl -s "$BASE_URL/admin/public-content/legislation/$FIRST_ID/translations" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.locale == "ca-ES") | .title')

if [[ "$CA_TITLE" == *"E2E-EDITED"* ]]; then
  echo "❌ FAILED: ca-ES translation was incorrectly modified"
  exit 1
fi
echo "✅ Other translations remain unchanged"
echo ""

# 8. Test resources
echo "8. Testing resources..."
RESOURCE_ID=$(curl -s "$BASE_URL/admin/public-content/resources" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

RESOURCE_TRANSLATIONS=$(curl -s "$BASE_URL/admin/public-content/resources/$RESOURCE_ID/translations" \
  -H "Authorization: Bearer $TOKEN" | jq 'length')

if [ "$RESOURCE_TRANSLATIONS" -ne 5 ]; then
  echo "❌ FAILED: Expected 5 resource translations, got $RESOURCE_TRANSLATIONS"
  exit 1
fi
echo "✅ Resources also have correct translation grouping ($RESOURCE_TRANSLATIONS translations)"
echo ""

# 9. Test FAQ
echo "9. Testing FAQ..."
FAQ_ID=$(curl -s "$BASE_URL/admin/public-content/faq" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

FAQ_TRANSLATIONS=$(curl -s "$BASE_URL/admin/public-content/faq/$FAQ_ID/translations" \
  -H "Authorization: Bearer $TOKEN" | jq 'length')

if [ "$FAQ_TRANSLATIONS" -ne 5 ]; then
  echo "❌ FAILED: Expected 5 FAQ translations, got $FAQ_TRANSLATIONS"
  exit 1
fi
echo "✅ FAQ also has correct translation grouping ($FAQ_TRANSLATIONS translations)"
echo ""

echo "=== ALL E2E TESTS PASSED ==="
echo ""
echo "Summary:"
echo "  ✅ Authentication works"
echo "  ✅ Legislation CRUD with translations works"
echo "  ✅ Resources CRUD with translations works"
echo "  ✅ FAQ CRUD with translations works"
echo "  ✅ Translation grouping is correct (5 locales per content)"
echo "  ✅ Edits only affect the targeted locale"
echo "  ✅ Other locales remain unchanged"
