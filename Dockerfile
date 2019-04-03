FROM node:dubnium-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Binary dependency
RUN apk --no-cache add openssl

# Install app dependencies
COPY package.json npm-shrinkwrap.json /usr/src/app/
RUN npm install --quiet

# Bundle app source
COPY . /usr/src/app

# Build front-end
RUN npm run build

# Run app
EXPOSE 3000
CMD ["npm", "start"]
