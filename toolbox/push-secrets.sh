#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# push-secrets.sh
# Reads secrets from .env in the repo root and pushes them to GitHub via gh CLI.
# Usage: ./toolbox/push-secrets.sh
#
# Supports multiline values (e.g. SSH private keys) using quoted blocks:
#   SSH_PRIVATE_KEY="-----BEGIN OPENSSH PRIVATE KEY-----
#   ...
#   -----END OPENSSH PRIVATE KEY-----"
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
KEY=""
VALUE=""
IN_MULTILINE=false

flush() {
  if [[ -z "$KEY" ]]; then return; fi
  if [[ -z "$VALUE" ]]; then
    echo "  SKIP  ${KEY}  (no value set)"
    SKIPPED=$((SKIPPED + 1))
  else
    gh secret set "$KEY" --body "$VALUE" --repo "$REPO"
    echo "  SET   ${KEY}"
    PUSHED=$((PUSHED + 1))
  fi
  KEY=""
  VALUE=""
}

while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip empty lines and comments (outside multiline blocks)
  if [[ "$IN_MULTILINE" == false ]]; then
    [[ -z "$line" || "$line" =~ ^# ]] && continue
  fi

  if [[ "$IN_MULTILINE" == true ]]; then
    # Check if this line closes the multiline value (ends with a quote)
    if [[ "$line" == *'"' ]]; then
      VALUE="${VALUE}"$'\n'"${line%\"}"
      IN_MULTILINE=false
      flush
    else
      VALUE="${VALUE}"$'\n'"${line}"
    fi
    continue
  fi

  # Split on first = only
  KEY="${line%%=*}"
  RAW="${line#*=}"

  # Check if value starts with a quote but doesn't end with one (multiline)
  if [[ "$RAW" == '"'* && "$RAW" != *'"' || "$RAW" == '"' ]]; then
    VALUE="${RAW#\"}"
    IN_MULTILINE=true
    continue
  fi

  # Strip surrounding quotes from single-line values
  VALUE="${RAW%\"}"
  VALUE="${VALUE#\"}"

  flush

done < "$ENV_FILE"

# Flush last entry if file doesn't end with newline
flush

echo ""
echo "Done — ${PUSHED} secret(s) pushed, ${SKIPPED} skipped."
