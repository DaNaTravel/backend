FROM node:16-alpine

WORKDIR /app-folder

COPY package*.json ./

RUN sudo npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]