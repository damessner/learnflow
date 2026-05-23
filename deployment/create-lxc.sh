#!/bin/bash
set -e

# Proxmox VE helper - create Debian 12 LXC for LearnFlow
# Usage: ./create-lxc.sh <CT_ID> <HOSTNAME> <PASSWORD>

CT_ID=${1:-200}
HOSTNAME=${2:-learnflow}
PASSWORD=${3:-changeme}

echo "Fetching latest Debian 12 template..."
pveam update >/dev/null 2>&1
TEMPLATE=$(pveam available -section system | grep debian-12-standard | awk '{print $2}' | head -n 1)

if [ -z "$TEMPLATE" ]; then
  echo "Could not find Debian 12 template."
  exit 1
fi

echo "Downloading $TEMPLATE..."
pveam download local $TEMPLATE >/dev/null 2>&1 || true
TEMPLATE_FILE=$(basename $TEMPLATE)

echo "Creating LXC container $CT_ID ($HOSTNAME)..."

pct create $CT_ID \
  local:vztmpl/$TEMPLATE_FILE \
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
pct exec $CT_ID -- bash -c "git clone https://github.com/damessner/learnflow.git /var/www/learnflow || echo 'Clone failed, continuing manually'"

echo "Running setup script..."
pct exec $CT_ID -- bash -c "cd /var/www/learnflow && bash deployment/setup-lxc.sh"

echo "=== Container created ==="
echo "CT ID: $CT_ID"
echo "Access the container: pct enter $CT_ID"
echo "IP address: $(pct exec $CT_ID -- hostname -I)"
