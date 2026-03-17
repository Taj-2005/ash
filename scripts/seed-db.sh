#!/usr/bin/env bash
# =============================================================================
#  scripts/seed-db.sh
#  Idempotent database seed script.
#  Uses Prisma's built-in upsert-based seed so running it twice is harmless.
#
#  Usage:
#    chmod +x scripts/seed-db.sh
#    ./scripts/seed-db.sh
# =============================================================================

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"

echo "============================================"
echo " Campus Bites – DB Seed"
echo " $(date)"
echo "============================================"

# Load nvm (idempotent)
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "$APP_DIR/backend"

# Run migrations first (idempotent – Prisma tracks applied migrations)
echo "[1/2] Running Prisma migrations..."
npx prisma migrate deploy

# Run seed (idempotent – seed.js must use upsert, not create)
echo "[2/2] Seeding database..."
npx prisma db seed

echo ""
echo "✅ Database seeded successfully."
