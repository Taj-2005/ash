#!/usr/bin/env bash
# =============================================================================
#  scripts/deploy.sh
#  Idempotent deployment script – safe to run multiple times.
#
#  Usage (locally or from CI):
#    chmod +x scripts/deploy.sh
#    ./scripts/deploy.sh
# =============================================================================

set -euo pipefail

APP_DIR="/home/ubuntu/campus-bites"
REPO_URL="https://github.com/${GITHUB_REPOSITORY:-your-org/campus-bites}"
BRANCH="${DEPLOY_BRANCH:-main}"

echo "============================================"
echo " Campus Bites – Deploy"
echo " Branch : $BRANCH"
echo " $(date)"
echo "============================================"

# Load nvm (idempotent)
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# ── 1. Pull latest code ───────────────────────────────────────────────────────
echo "[1/5] Pulling latest code..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ -d ".git" ]; then
  git fetch origin
  git reset --hard "origin/$BRANCH"
  git clean -fd
else
  git clone "$REPO_URL" .
  git checkout "$BRANCH"
fi

# ── 2. Backend ────────────────────────────────────────────────────────────────
echo "[2/5] Installing backend dependencies..."
cd "$APP_DIR/backend"
npm ci --omit=dev --quiet

echo "  Running Prisma migrations (idempotent)..."
npx prisma migrate deploy

# ── 3. Frontend ───────────────────────────────────────────────────────────────
echo "[3/5] Building frontend..."
cd "$APP_DIR/frontend"
npm ci --quiet
npm run build

# ── 4. PM2 – start or restart (idempotent) ────────────────────────────────────
echo "[4/5] Starting/restarting services via PM2..."

# Backend
if pm2 describe campus-bites-backend > /dev/null 2>&1; then
  pm2 restart campus-bites-backend
else
  pm2 start "$APP_DIR/backend/server.js" \
    --name campus-bites-backend \
    --log "$APP_DIR/logs/backend.log" \
    --error "$APP_DIR/logs/backend-error.log"
fi

# Frontend
if pm2 describe campus-bites-frontend > /dev/null 2>&1; then
  pm2 restart campus-bites-frontend
else
  pm2 start npm \
    --name campus-bites-frontend \
    --log "$APP_DIR/logs/frontend.log" \
    --error "$APP_DIR/logs/frontend-error.log" \
    -- start
fi

# Persist PM2 process list (idempotent)
pm2 save

# ── 5. Health check ───────────────────────────────────────────────────────────
echo "[5/5] Waiting for backend to be healthy..."
MAX_RETRIES=10
COUNT=0
until curl -sf http://localhost:3001/api/status > /dev/null 2>&1; do
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$MAX_RETRIES" ]; then
    echo "  ❌ Backend health check failed after $MAX_RETRIES attempts"
    pm2 logs campus-bites-backend --lines 20 --nostream
    exit 1
  fi
  echo "  Waiting... ($COUNT/$MAX_RETRIES)"
  sleep 3
done

echo ""
echo "============================================"
echo " ✅ Deployment successful!"
echo " Backend  : http://localhost:3001"
echo " Frontend : http://localhost:3000"
echo "============================================"
pm2 list
