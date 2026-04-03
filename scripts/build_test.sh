#!/bin/bash

set -e

"$(dirname "$0")/publish_frontend.sh" test

echo "Test build completed"
