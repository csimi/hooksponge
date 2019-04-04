FROM node:dubnium-alpine as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk --no-cache add openssl

COPY package.json npm-shrinkwrap.json /usr/src/app/
RUN npm install --quiet

COPY . /usr/src/app
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:dubnium-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk --no-cache add openssl

COPY package.json npm-shrinkwrap.json /usr/src/app/
RUN npm install --quiet --only=production

COPY . /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]
