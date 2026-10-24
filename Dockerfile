# ag-relay — persistent server image (own VPS / Docker path).
# No dependencies: the relay is plain Node, so the image is tiny.
# Configure ONLY with environment variables (never bake secrets into the image):
#   AG_REFRESH_TOKEN, AG_CLIENT_ID, AG_CLIENT_SECRET (required)
#   RELAY_API_KEY (required on any reachable port), AG_PROJECT_ID (optional, leave unset)
# Get the values from the setup page (setup.html) or `npm run login` on your own machine.
FROM node:22-alpine

WORKDIR /app
COPY package.json ./
COPY lib ./lib
COPY bin ./bin

# Runs as the unprivileged node user; config comes from env, so no volume is needed.
USER node
EXPOSE 8787
ENV PORT=8787
CMD ["node", "bin/ag-serve.mjs"]
