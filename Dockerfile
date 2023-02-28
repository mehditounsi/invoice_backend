FROM node:16

WORKDIR /usr/src/app

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN npm install knex -g
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /opt/app
COPY . /opt/app

EXPOSE 3000

CMD [ "node", "index.js" ]