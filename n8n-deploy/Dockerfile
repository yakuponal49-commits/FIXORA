FROM n8nio/n8n:latest

USER root

RUN npm install -g n8n

USER node

ENV N8N_PORT=5678
ENV N8N_PROTOCOL=https
ENV WEBHOOK_URL=https://n8n.fixora.app
ENV N8N_RUNNERS_ENABLED=true

EXPOSE 5678

CMD ["n8n", "start"]
