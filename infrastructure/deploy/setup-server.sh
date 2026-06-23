#!/bin/bash
# Run ONCE on the server to prepare for GitHub Actions deployment
# Usage: chmod +x setup-server.sh && ./setup-server.sh

set -e

SERVER_USER=${1:-$(whoami)}
SERVER_IP=${2:-$(hostname -I | awk '{print $1}')}

echo "=== Setting up deployment user: $SERVER_USER@$SERVER_IP"

# Create deployment user if not exists
ssh "$SERVER_USER@$SERVER_IP" "id deploy || sudo useradd -m -s /bin/bash deploy"
ssh "$SERVER_USER@$SERVER_IP" "sudo usermod -aG docker deploy"

# Authorize GitHub Actions SSH key
echo "Paste the contents of ~/.ssh/id_ed25519.pub from your local machine:"
read -r PUBKEY
ssh "$SERVER_USER@$SERVER_IP" "echo '$PUBKEY' | sudo tee /home/deploy/.ssh/authorized_keys > /dev/null"
ssh "$SERVER_USER@$SERVER_IP" "sudo chown -R deploy:deploy /home/deploy/.ssh && sudo chmod 700 /home/deploy/.ssh && sudo chmod 600 /home/deploy/.ssh/authorized_keys"

echo "=== Server ready for GitHub Actions ==="
echo "Now add these secrets to GitHub:"
echo "  SERVER_HOST: $SERVER_IP"
echo "  SERVER_USER: deploy"
echo "  SSH_KEY: (contents of ~/.ssh/id_ed25519 on your local machine)"
