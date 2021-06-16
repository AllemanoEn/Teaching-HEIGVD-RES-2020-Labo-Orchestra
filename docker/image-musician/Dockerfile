FROM node:16

RUN npm install rfc4122

WORKDIR /opt/app/

COPY src /opt/app/

ENTRYPOINT ["node", "/opt/app/app.js"]