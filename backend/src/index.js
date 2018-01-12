const debug = require('debug')('weathermap');

const Koa = require('koa');
const router = require('koa-router')();
const fetch = require('node-fetch');
const cors = require('kcors');

const appId = process.env.APPID || '3ca77ecf6381a2ca4cb61e387146a3d4';
const mapURI = process.env.MAP_ENDPOINT || "http://api.openweathermap.org/data/2.5";
const targetCity = process.env.TARGET_CITY || "Helsinki,fi";

const port = process.env.PORT || 9000;

const app = new Koa();

app.use(cors());

const fetchWeather = async () => {
  const endpoint = `${mapURI}/weather?q=${targetCity}&appid=${appId}&`;
  const response = await fetch(endpoint);

  return response ? response.json() : {}
};

const fetchForecast = async () => {
  const endpoint = `${mapURI}/forecast?q=${targetCity}&appid=${appId}&`;
  const response = await fetch(endpoint);

  return response ? response.json() : {}
};

router.get('/api/weather', async ctx => {
  const res = {};
  const weatherData = await fetchWeather();
  const forecastData = await fetchForecast();
  
  //Fill array of current weather + forecast in the next 9h
  if(forecastData.list !== null && weatherData.weather !== null){
  	res['weather'] = [];
  	res['weather'].push(weatherData.weather[0]);
  	res['weather'].push(forecastData.list[0]);
  	res['weather'].push(forecastData.list[1]);
  	res['weather'].push(forecastData.list[2]);
  }
  
  ctx.type = 'application/json; charset=utf-8';
  ctx.body = res;

});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port);

console.log(`App listening on port ${port}`);
