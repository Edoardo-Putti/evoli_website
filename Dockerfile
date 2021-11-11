FROM node:alpine
WORKDIR /evoli
COPY package*.json ./

RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "run", "start" ]