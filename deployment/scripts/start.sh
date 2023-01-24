#!/usr/bin/env bash

set -e

# Set up NVM
export NVM_DIR=$HOME/.nvm
source $NVM_DIR/nvm.sh

# Activate the desired Node.js version
# TODO: switch to LTS once https://github.com/prisma/prisma/issues/10649#issuecomment-1249209025 gets fixed
# Prisma currently leads to segmentation faults when trying to connect to PostgreSQL under Node 18
nvm use 16

# Start the Next.js production server
npm run start
