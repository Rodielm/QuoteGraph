#!/bin/sh
set -e

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__ENV__ = {
  API_URL: "${FRONTEND_API_URL:-/api}"
};
EOF

exec nginx -g "daemon off;"
