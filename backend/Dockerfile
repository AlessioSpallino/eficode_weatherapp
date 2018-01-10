FROM node:7
RUN mkdir /backend
ADD . /backend
WORKDIR /backend
RUN npm i
EXPOSE 80
CMD ["npm", "start"]