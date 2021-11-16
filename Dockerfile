FROM node:alpine
WORKDIR /evoli
COPY package*.json ./

RUN npm install
#RUN npm install pm2 -g
COPY . .
EXPOSE 8080
CMD [ "npm", "run", "start" ]