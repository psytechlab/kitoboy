# dev
FROM node:20.15.0-alpine AS dev
RUN apk add --no-cache tzdata
ENV TZ=Europe/Moscow
ENV NODE_PATH=/opt/api/node_modules

WORKDIR /opt/api/

CMD ["node"]

# production
FROM node:20.15.0-alpine AS production
RUN apk add --no-cache tzdata
ENV TZ=Europe/Moscow
ENV NODE_PATH=/opt/api/node_modules

WORKDIR /opt/api/

COPY /*.json ./
RUN npm i

CMD ["sh", "-c", "npm run dev"]
