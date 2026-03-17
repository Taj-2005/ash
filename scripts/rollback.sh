#!/usr/bin/env bash
# =============================================================================
#  scripts/rollback.sh
#  Roll back to the previous git commit and restart services.
#  Idempotent: safe to call multiple times (each call rolls back one commit).
#
#  Usage:
#    chmod +x scripts/rollback.sh
#    ./scripts/rollback.sh [commit-sha]   # optional: specify exact SHA
# =============================================================================

set -euo pipefail

APP_DIR="/home/ubuntu/campus-bites"
TARGET_SHA="${1:-HEAD~1}"

export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "============================================"
echo " Campus Bites – Rollback to: $TARGET_SHA"
echo " $(date)"
echo "============================================"

cd "$APP_DIR"
git checkout "$TARGET_SHA"

# Reinstall deps in case package.json changed
cd backend  && npm ci --omit=dev --quiet && npx prisma migrate deploy
cd ../frontend && npm ci --quiet && npm run build

# Restart (idempotent)
pm2 restart campus-bites-backend  || true
pm2 restart campus-bites-frontend || true
pm2 save

echo "✅ Rollback complete. Now running: $(git rev-parse --short HEAD)"
