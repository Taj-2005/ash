#!/bin/bash

# ===== CONFIG =====
INSTANCE_ID="i-039657e26e2fab075"

# ===== INPUT =====
ACTION=$1

# ===== SCOUT =====
CURRENT_STATE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[].Instances[].State.Name" \
  --output text)

echo "[INFO] Current State: $CURRENT_STATE"

# ===== LOGIC =====
if [ "$ACTION" = "start" ]; then
    if [ "$CURRENT_STATE" = "running" ]; then
        echo "[SKIP] Instance is already running"
    else
        echo "[INFO] Requesting Start for $INSTANCE_ID..."
        aws ec2 start-instances --instance-ids "$INSTANCE_ID"
    fi

elif [ "$ACTION" = "stop" ]; then
    if [ "$CURRENT_STATE" = "stopped" ]; then
        echo "[SKIP] Instance is already stopped"
    else
        echo "[INFO] Requesting Stop for $INSTANCE_ID..."
        aws ec2 stop-instances --instance-ids "$INSTANCE_ID"
    fi

else
    echo "[ERROR] Invalid command"
    echo "Usage: ./safe-ec2-control.sh start | stop"
    exit 1
fi

