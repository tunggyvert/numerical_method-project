FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3001

CMD ["sh", "-c", "./wait-for-it.sh db 3306 node server.js"]
