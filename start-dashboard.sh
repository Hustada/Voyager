#!/bin/bash
# Start Voyager Dashboard

cd "$(dirname "$0")/dashboard"

echo "Starting Voyager Dashboard..."
echo ""

# Start control server in background
node server.js &
SERVER_PID=$!
echo "Control server started (PID: $SERVER_PID)"

# Start Vite dev server
echo "Starting dashboard at http://localhost:5173"
echo ""
echo "Next steps:"
echo "  1. Open Minecraft and 'Open to LAN'"
echo "  2. Go to http://localhost:5173"
echo "  3. Enter the LAN port and click Start"
echo ""
npm run dev

# Cleanup on exit
kill $SERVER_PID 2>/dev/null
