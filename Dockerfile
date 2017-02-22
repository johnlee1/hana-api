FROM node:6.9-alpine

# need this for bcrypt node module
RUN apk add --no-cache make gcc g++ python

COPY package.json/ /api/

WORKDIR /api

RUN npm install --production

WORKDIR /

COPY config/auth.js /api/config/
COPY config/database.js /api/config/
COPY config/routes.js /api/config/
COPY config/server.js /api/config/
COPY src/ /api/src
COPY index.js/ /api/

WORKDIR /api

EXPOSE 3000

CMD ["node", "index.js"]
