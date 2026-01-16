#!/bin/bash
# Kill any existing process on port 3000
fuser -k 3000/tcp 2>/dev/null || true

# Set environment
export NODE_ENV=production
export PORT=3000

# Start server in background
nohup node server/index.js > app.log 2>&1 &

echo "Wallestars server started on port 3000 with PID $!"
echo "Logs are being written to app.log"
