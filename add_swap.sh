#!/bin/bash
# Run this on your VPS to add 1GB of Swap space
# This prevents crashes during npm install

# 1. Create a file for swap
sudo fallocate -l 3G /swapfile

# 2. Secure the file
sudo chmod 600 /swapfile

# 3. Format it as swap
sudo mkswap /swapfile

# 4. Enable it
sudo swapon /swapfile

# 5. Make it permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

echo "Success! Swap created. Check with 'free -h'"
