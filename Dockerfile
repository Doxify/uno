# base image we are basing our image on
FROM node:14-alpine

RUN mkdir /home/app

# create app directory
WORKDIR /home/app

COPY /app/package.json /home/app

RUN npm install

COPY /app /home/app

# start the app via node
CMD ["node", "bin/www"]

EXPOSE 3000