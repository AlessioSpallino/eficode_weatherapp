import React from 'react';
import ReactDOM from 'react-dom';

const baseURL = process.env.ENDPOINT;

/// Config for the app setup
const config = {
  latitude: 0,
  longitude: 0,
  mapZoomLevel: 10
}

/**
* Run when page is loaded, call backend
*/
const getWeatherFromApi = async () => {

  try {

    const url = await getLocation();
    console.log("fetcho adesso: " + url);
    const response = await fetch(url);

    return response.json();

  } catch (error) {
    console.error(error);
  }

  return {};
};


const getLocation = async () => {
  console.log('getting location...');
  if (navigator.geolocation) {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => resolve(position));
    });
    config.latitude = position.coords.latitude;
    config.longitude = position.coords.longitude;
    const url = `${baseURL}/weather/`.concat(config.latitude + "/" + config.longitude);
    return url;
  }
}


class Weather extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      icon: ""
    };
  }
  
  async componentWillMount() {
    const res = await getWeatherFromApi();
    console.log(config.latitude);
    this.setState({icon: res.weather[0].icon.slice(0, -1)});
  }



  render() {
    const { icon } = this.state;

    return (
      <div className="icon">
      { icon && <img src={`/img/${icon}.svg`} /> }
      </div>
      );
    }
  }

  ReactDOM.render(
  <Weather />,
  document.getElementById('app')
  );
