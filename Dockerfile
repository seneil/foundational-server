FROM node:boron

RUN useradd --system --user-group --create-home app && \
    mkdir /usr/src/app && chown app:app /usr/src/app

RUN npm install -g pm2

USER app
WORKDIR /usr/src/app

EXPOSE 3001
