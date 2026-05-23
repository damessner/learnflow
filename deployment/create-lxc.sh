#!/bin/bash
set -e

# Proxmox VE helper - create Debian 12 LXC for LearnFlow
# Usage: ./create-lxc.sh <CT_ID> <HOSTNAME> <PASSWORD>

CT_ID=${1:-200}
HOSTNAME=${2:-learnflow}
PASSWORD=${3:-changeme}

echo "Creating LXC container $CT_ID ($HOSTNAME)..."

pct create $CT_ID \
  local:vztmpl/debian-12-standard_12.0-1_amd64.tar.zst \
  --hostname $HOSTNAME \
  --password $PASSWORD \
  --rootfs local-lvm:8 \
  --cores 2 \
  --memory 2048 \
  --swap 512 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 \
  --features nesting=1 \
  --start 1

sleep 10

echo "Installing dependencies inside container..."
pct exec $CT_ID -- bash -c "apt-get update && apt-get install -y git curl"

echo "Cloning repository..."
pct exec $CT_ID -- bash -c "git clone https://github.com/your-org/learnflow.git /var/www/learnflow || echo 'Clone failed, continuing manually'"

echo "Running setup script..."
pct exec $CT_ID -- bash -c "cd /var/www/learnflow && bash deployment/setup-lxc.sh"

echo "=== Container created ==="
echo "CT ID: $CT_ID"
echo "Access the container: pct enter $CT_ID"
echo "IP address: $(pct exec $CT_ID -- hostname -I)"
