# dev
FROM node:20.15.0-alpine AS dev
RUN apk add --no-cache tzdata
ENV TZ=Europe/Moscow
ENV NODE_PATH=/opt/frontend/node_modules

WORKDIR /opt/frontend/

CMD [ "node" ]

# production
FROM node:20.15.0-alpine AS production
RUN apk add --no-cache tzdata
ENV TZ=Europe/Moscow
ENV NODE_PATH=/opt/frontend/node_modules

WORKDIR /opt/frontend/

COPY /*.json ./
RUN npm i

CMD [ "node" ]
