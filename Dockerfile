FROM node:6.2.2

COPY package.json/ /api/

WORKDIR /api

RUN npm install

WORKDIR /

COPY config/auth.js /api/config/
COPY config/database.js /api/config/
COPY config/routes.js /api/config/
COPY config/server.js /api/config/
COPY lib/ /api/lib
COPY index.js/ /api/

WORKDIR /api

EXPOSE 3000

CMD ["node", "index.js"]