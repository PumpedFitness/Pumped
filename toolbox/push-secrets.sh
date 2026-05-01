#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# push-secrets.sh
# Reads secrets from .env in the repo root and pushes them to GitHub via gh CLI.
# Usage: ./toolbox/push-secrets.sh
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

# ── Checks ──────────────────────────────────────────────────────────────────

if ! command -v gh &>/dev/null; then
  echo "Error: gh CLI is not installed. https://cli.github.com"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "Error: not authenticated with gh. Run: gh auth login"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env not found at ${ENV_FILE}"
  echo "Copy .env.example to .env and fill in your values first."
  exit 1
fi

# ── Resolve repo ─────────────────────────────────────────────────────────────

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)

if [[ -z "$REPO" ]]; then
  echo "Error: could not determine GitHub repository. Are you inside a git repo with a GitHub remote?"
  exit 1
fi

echo "Pushing secrets to: ${REPO}"
echo ""

# ── Push ─────────────────────────────────────────────────────────────────────

PUSHED=0
SKIPPED=0

while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" =~ ^# ]] && continue

  # Split on first = only
  KEY="${line%%=*}"
  VALUE="${line#*=}"

  # Skip keys with empty values
  if [[ -z "$VALUE" ]]; then
    echo "  SKIP  ${KEY}  (no value set)"
    ((SKIPPED++))
    continue
  fi

  gh secret set "$KEY" --body "$VALUE" --repo "$REPO"
  echo "  SET   ${KEY}"
  ((PUSHED++))

done < "$ENV_FILE"

echo ""
echo "Done — ${PUSHED} secret(s) pushed, ${SKIPPED} skipped."
