FROM node:lts-alpine
RUN apk add --no-cache python3 make g++
ENV NODE_ENV=production
WORKDIR /usr/src/app/
RUN chown -R node /usr/src/app/
WORKDIR /usr/src/app/backend
COPY backend/package*.json ./
RUN  npm install
COPY backend/ ./
EXPOSE 5000
USER node
CMD ["npm", "start"]
