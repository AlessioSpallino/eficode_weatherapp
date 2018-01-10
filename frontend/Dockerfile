FROM node:7
RUN mkdir /frontend
ADD . /frontend
WORKDIR /frontend
RUN npm i
EXPOSE 80
CMD ["npm", "start"]