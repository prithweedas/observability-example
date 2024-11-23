FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY *.js .

COPY ./config/wait-for-apm.sh wait-for-apm.sh

EXPOSE 3000

CMD sh wait-for-apm.sh "node service-01.js"
