FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY *.js .

EXPOSE 3000

CMD ["node", "service-01.js"]
