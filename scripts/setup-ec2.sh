#!/usr/bin/env bash
# =============================================================================
#  scripts/setup-ec2.sh
#  Idempotent server bootstrap for Campus Bites on Ubuntu EC2.
#
#  Idempotency guarantee:
#    - Safe to run multiple times – every command is conditional or uses flags
#      (mkdir -p, apt-get with -y, nvm idempotent install, pm2 check before start)
#    - Does NOT fail or duplicate work on subsequent runs.
#
#  Usage:
#    chmod +x scripts/setup-ec2.sh
#    ./scripts/setup-ec2.sh
# =============================================================================

set -euo pipefail

echo "============================================"
echo " Campus Bites – EC2 Bootstrap"
echo " $(date)"
echo "============================================"

# ── 1. System packages ─────────────────────────────────────────────────────────
echo "[1/6] Updating system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq git curl build-essential nginx

# ── 2. Node.js via nvm ────────────────────────────────────────────────────────
echo "[2/6] Installing Node.js via nvm..."
export NVM_DIR="$HOME/.nvm"

# Idempotent: only install nvm if not already present
if [ ! -d "$NVM_DIR" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# Load nvm (handles already-loaded case gracefully)
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node 20 (idempotent)
nvm install 20
nvm use 20
nvm alias default 20

node -v
npm -v

# ── 3. PM2 ────────────────────────────────────────────────────────────────────
echo "[3/6] Installing PM2 process manager..."
# npm install -g is idempotent when the same version is already installed
npm install -g pm2 --quiet

# Ensure pm2 starts on system boot (idempotent)
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | bash || true

# ── 4. App directory ──────────────────────────────────────────────────────────
echo "[4/6] Setting up app directory..."
# mkdir -p is idempotent by design
mkdir -p /home/ubuntu/campus-bites
mkdir -p /home/ubuntu/campus-bites/logs

# ── 5. Nginx ──────────────────────────────────────────────────────────────────
echo "[5/6] Configuring Nginx reverse proxy..."
NGINX_CONF="/etc/nginx/sites-available/campus-bites"

# Only write config if it doesn't already exist (idempotent write)
if [ ! -f "$NGINX_CONF" ]; then
  sudo tee "$NGINX_CONF" > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

    # Frontend (Next.js)
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass         http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX_EOF

  # Enable site (idempotent symlink)
  sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/campus-bites

  # Remove default site if present (idempotent)
  sudo rm -f /etc/nginx/sites-enabled/default
fi

sudo nginx -t && sudo systemctl reload nginx

# ── 6. Environment file template ──────────────────────────────────────────────
echo "[6/6] Creating .env template (if not present)..."
ENV_FILE="/home/ubuntu/campus-bites/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
  mkdir -p "$(dirname "$ENV_FILE")"
  cat > "$ENV_FILE" << 'ENV_EOF'
# ── Fill in these values on the server ──
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/campus_bites
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING
PORT=3001
NODE_ENV=production

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ENV_EOF
  echo "  ⚠  Edit $ENV_FILE with real values before starting the app."
fi

echo ""
echo "============================================"
echo " Bootstrap complete!"
echo " Next steps:"
echo "   1. Edit /home/ubuntu/campus-bites/backend/.env"
echo "   2. Run: ./scripts/deploy.sh"
echo "============================================"
