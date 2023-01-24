#!/usr/bin/env bash

set -e

# Set up NVM
export NVM_DIR=$HOME/.nvm
source $NVM_DIR/nvm.sh

# Activate the desired Node.js version
nvm use --lts

# Start the Next.js production server
npm run start
