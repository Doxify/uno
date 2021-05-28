FROM node:14-alpine

RUN mkdir /home/app
WORKDIR /home/app

COPY /app /home/app

RUN npm install

EXPOSE 3000

CMD ["node", "bin/www"]