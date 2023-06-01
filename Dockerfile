FROM node:16
RUN npm install --global yarn
WORKDIR /usr/src/app
COPY . .
RUN yarn install
RUN yarn run build
USER node
CMD yarn run start