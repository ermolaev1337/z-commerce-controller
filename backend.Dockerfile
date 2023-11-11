FROM node:latest

WORKDIR /app
COPY ./package.json /app/package.json
RUN yarn install
COPY ./src /app/src
RUN mkdir "tmp"

CMD ["yarn", "start"]