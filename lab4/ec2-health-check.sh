#!/bin/bash

# ===== CONFIG =====
INSTANCE_ID="i-039657e26e2fab075"

# ===== FETCH STATE =====
STATE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[].Instances[].State.Name" \
  --output text)

# ===== FETCH HEALTH =====
SYSTEM_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids "$INSTANCE_ID" \
  --query "InstanceStatuses[].SystemStatus.Status" \
  --output text)

INSTANCE_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids "$INSTANCE_ID" \
  --query "InstanceStatuses[].InstanceStatus.Status" \
  --output text)

# ===== ANALYSIS =====
if [ "$SYSTEM_STATUS" = "ok" ] && [ "$INSTANCE_STATUS" = "ok" ]; then
    HEALTH="[OK]"
    MESSAGE="System Healthy"
else
    HEALTH="[ALERT]"
    MESSAGE="Check System!"
fi

# ===== OUTPUT =====
echo "Instance ID: $INSTANCE_ID"
echo "State:       $STATE"
echo "Health:      $HEALTH $MESSAGE"
