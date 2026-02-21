#!/usr/bin/env bash
# Test RapidAPI Google Translate endpoint.
# Usage: ./scripts/test-translate-api.sh [path]
# If path is omitted, reads from .env (VITE_RAPIDAPI_TRANSLATE_PATH) or defaults to /v1/translate.
#
# Uses batch JSON endpoint: body { from, to, json: ["Hello"] }. Response: { trans: [...] }.

set -e
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "No .env file. Copy .env.example to .env and set VITE_RAPIDAPI_KEY and VITE_RAPIDAPI_TRANSLATE_HOST."
  exit 1
fi

KEY=""
HOST=""
PATH_ARG="/api/v1/translator/json"

while IFS= read -r line; do
  [[ $line =~ ^#.*$ ]] && continue
  if [[ $line =~ ^VITE_RAPIDAPI_KEY=(.*)$ ]]; then
    KEY="${BASH_REMATCH[1]}"
  elif [[ $line =~ ^VITE_RAPIDAPI_TRANSLATE_HOST=(.*)$ ]]; then
    HOST="${BASH_REMATCH[1]}"
  elif [[ $line =~ ^VITE_RAPIDAPI_TRANSLATE_PATH=(.*)$ ]]; then
    PATH_ARG="${BASH_REMATCH[1]}"
  fi
done < .env

if [[ -n "$1" ]]; then
  PATH_ARG="$1"
fi

[[ -z $KEY ]] && { echo "VITE_RAPIDAPI_KEY not set in .env"; exit 1; }
[[ -z $HOST ]] && { echo "VITE_RAPIDAPI_TRANSLATE_HOST not set in .env"; exit 1; }

PATH_ARG="${PATH_ARG#/}"
URL="https://${HOST}/${PATH_ARG}"
echo "Request URL: $URL"
echo ""

RESP=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Key: $KEY" \
  -H "X-RapidAPI-Host: $HOST" \
  -d '{"from":"en","to":"hi","json":["Hello"]}')

HTTP_CODE=$(echo "$RESP" | tail -1)
HTTP_BODY=$(echo "$RESP" | sed '$d')

echo "HTTP status: $HTTP_CODE"
echo "Response: $HTTP_BODY"
echo ""

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "Success. Response should have 'trans' (array or object with 0,1,...)."
else
  echo "Failed. Path is /api/v1/translator/json for batch JSON translate."
fi
