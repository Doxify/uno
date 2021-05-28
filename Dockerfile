FROM node:14-alpine

RUN mkdir /home/app
WORKDIR /home/app

COPY /app/package.json /home/app
COPY /app /home/app

RUN npm install

CMD ["node", "bin/www"]
EXPOSE 3000