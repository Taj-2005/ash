#!/bin/bash

# ===== CONFIG =====
INSTANCE_ID="i-039657e26e2fab075"

# ===== INPUT =====
ACTION=$1

# ===== LOGIC =====
if [ "$ACTION" = "start" ]; then
    echo "[INFO] Requesting Start for $INSTANCE_ID..."
    aws ec2 start-instances --instance-ids "$INSTANCE_ID"

elif [ "$ACTION" = "stop" ]; then
    echo "[INFO] Requesting Stop for $INSTANCE_ID..."
    aws ec2 stop-instances --instance-ids "$INSTANCE_ID"

else
    echo "[ERROR] Invalid command"
    echo "Usage: ./ec2-control.sh start | stop"
    exit 1
fi

