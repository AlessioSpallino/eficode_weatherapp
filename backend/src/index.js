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

const fetchWeather = async (pos) => {
  const endpoint = `${mapURI}/weather?q=${pos}&appid=${appId}&`;
  const response = await fetch(endpoint);

  return response ? response.json() : {}
};

const fetchWeatherLatLon = async (lat, lon) => {
  const endpoint = `${mapURI}/weather?lat=${lat}&lon=${lon}&appid=${appId}&`;
  const response = await fetch(endpoint);

  return response ? response.json() : {}
};

const fetchForecastLatLon = async (lat, lon) => {
  const endpoint = `${mapURI}/forecast?lat=${lat}&lon=${lon}&appid=${appId}&`;
  const response = await fetch(endpoint);

  return response ? response.json() : {}
};

const fetchForecast = async (pos) => {
  const endpoint = `${mapURI}/forecast?q=${pos}&appid=${appId}&`;
  const response = await fetch(endpoint);

  return response ? response.json() : {}
};

router.get('/api/weather/:pos', async ctx => {
  const res = {};
  const weatherData = await fetchWeather(ctx.params.pos);
  const forecastData = await fetchForecast(ctx.params.pos);
  
  //Fill array of current weather + forecast in the next 9h
  if(forecastData.list !== null && weatherData.weather !== null){
      res['weather'] = [];
      res['place'] = [];
      res['forecast3'] = [];
      res['forecast6'] = [];
      res['forecast9'] = [];
      res['latitude'] = [];
      res['longitude'] = [];
      res['weather'].push(weatherData.weather[0]);
      res['weather'].push(forecastData.list[0]);
      res['weather'].push(forecastData.list[1]);
      res['weather'].push(forecastData.list[2]);
      res['place'].push(weatherData.name + "," + weatherData.sys.country);
      res['forecast3'].push(forecastData.list[0].dt_txt);
      res['forecast6'].push(forecastData.list[1].dt_txt);
      res['forecast9'].push(forecastData.list[2].dt_txt);
      res['latitude'].push(weatherData.coord.lat);
      res['longitude'].push(weatherData.coord.lon);
  }
  
  console.log(res);
  ctx.type = 'application/json; charset=utf-8';
  ctx.body = res;

});

router.get('/api/weather/:Lat/:Lon', async ctx => {
  const res = {};
  const weatherData = await fetchWeatherLatLon(ctx.params.Lat, ctx.params.Lon);
  const forecastData = await fetchForecastLatLon(ctx.params.Lat, ctx.params.Lon);

  //Fill array of current weather + forecast in the next 9h
  if(forecastData.list !== null && weatherData.weather !== null){
      res['weather'] = [];
      res['place'] = [];
      res['forecast3'] = [];
      res['forecast6'] = [];
      res['forecast9'] = [];
      res['weather'].push(weatherData.weather[0]);
      res['weather'].push(forecastData.list[0]);
      res['weather'].push(forecastData.list[1]);
      res['weather'].push(forecastData.list[2]);
      res['place'].push(weatherData.name + "," + weatherData.sys.country);
      res['forecast3'].push(forecastData.list[0].dt_txt);
      res['forecast6'].push(forecastData.list[1].dt_txt);
      res['forecast9'].push(forecastData.list[2].dt_txt);
  }

  ctx.type = 'application/json; charset=utf-8';
  ctx.body = res;

});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port);

console.log(`App listening on port ${port}`);
