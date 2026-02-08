#!/bin/sh

# Recreate env-config.js with runtime environment variables
cat <<EOF > /app/build/env-config.js
window._env_ = {
  REACT_APP_API_URL: "${REACT_APP_API_URL}",
  REACT_APP_OPENAPI_KEY: "${REACT_APP_OPENAPI_KEY}",
  REACT_APP_ANALYTICS_API_URL: "${REACT_APP_ANALYTICS_API_URL}",
};
EOF

echo "Runtime env-config.js generated:"
cat /app/build/env-config.js

# Start serve
exec serve -s build -l 3000
