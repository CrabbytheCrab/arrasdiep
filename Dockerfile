FROM node:16
WORKDIR /usr/src/app
COPY . .
RUN npm run build
USER node
CMD npm run start