#We use node:14 because the node:16 version trigger an update error on the npm version
FROM node:14

RUN apt-get update && apt-get upgrade -y

RUN npm install rfc4122

WORKDIR /opt/app/

COPY src /opt/app/

ENTRYPOINT ["node", "/opt/app/app.js"]
