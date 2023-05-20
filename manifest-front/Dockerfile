FROM node:18-alpine AS builder
WORKDIR /usr/share/nginx/
COPY package.json /usr/share/nginx/
COPY ./ /usr/share/nginx/
RUN npm i
# EXPOSE 5173
CMD ["npm", "run", "host"]


# docker build -t frontend-application .
# docker run -p 5173:80 frontend-application