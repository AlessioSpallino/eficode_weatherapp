import React from 'react';
import ReactDOM from 'react-dom';

const baseURL = process.env.ENDPOINT;

/// Google Maps const
var map = '';
var marker = '';
var mapZoomLevel = '';

/// Config for the app setup
const config = {
  latitude: 41.87,
  longitude: 12.56,
  mapZoomLevel: 10
}

/**
* Run when page is loaded, call backend to get weather with Lat and Lon
*/
const getWeatherFromPosition = async () => {

  try {

    console.log('getting location my position...');
    if (navigator.geolocation) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(position => resolve(position));
      });
    config.latitude = position.coords.latitude;
    config.longitude = position.coords.longitude;
    
    }

    const url = `${baseURL}/weather/`.concat(config.latitude + "/" + config.longitude);
    console.log("fetcho adesso: " + url);
    const response = await fetch(url);

    return response.json();

  } catch (error) {
    console.error(error);
  }

  return {};
};

/**
* Run when user is looking for weather in other places, call backend to get weather with location
*/
const getWeatherFromLocation = async (location) => {

  try {

    console.log('getting location from inserted location...');
    const response = await fetch(`${baseURL}/weather/`.concat(location));

    return response.json();

  } catch (error) {
    console.error(error);
  }

  return {};
};

/**
* Run when user clicks on the map or move the pin
*/
const getWeatherFromClick = async () => {

  try {

    console.log('getting location from user click...');
    const url = `${baseURL}/weather/`.concat(config.latitude + "/" + config.longitude);
    console.log("fetcho adesso: " + url);
    const response = await fetch(url);

    return response.json();

  } catch (error) {
    console.error(error);
  }

  return {};
};



class WeatherMap extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      location: "",
      //weather: "",
      //icon: "",
      currenticon: "",
      forecast3: "",
      forecast6: "",
      forecast9: "",

    };
  }

  renderMap() {

    /// Create a new map
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: config.latitude, lng: config.longitude},
      zoom: config.mapZoomLevel,
      disableDefaultUI: true,
      zoomControl: true
    });
  
    /// Create a new marker
    marker = new google.maps.Marker({
      position: {lat: config.latitude, lng: config.longitude},
      map: map,
      draggable: true
    });

    /// Set the initial pin drop animation
    marker.setAnimation(google.maps.Animation.DROP);
  
    /// Add an event listener for click
    google.maps.event.addListener(map, 'click', function(event) {
      const latLng = event.latLng;
      config.latitude = latLng.lat();
      config.longitude = latLng.lng();

      this.otherSearch();
    }.bind(this));
    
    /// Add an event listener for drag end
    google.maps.event.addListener(marker, 'dragend', function(event) {
      const latLng = event.latLng;
      config.latitude = latLng.lat();
      config.longitude = latLng.lng();
      
      this.otherSearch();
    }.bind(this));
    
    /// Update variable on map change
    map.addListener('zoom_changed', function() {
      config.mapZoomLevel = map.getZoom();
    });
  }

  formSubmit(e) {
    e.preventDefault();
    /// Clear the input
    this.refs.newLocation.getDOMNode().value = '';
  }

   /**
   * Run when 'search' button is pressed
   */
  async locationSearch() {
    /// Get the value from the search field
    const location = this.refs.newLocation.getDOMNode().value;
    if ( location !== '' )
    {
      const res = await getWeatherFromLocation(location);
      this.setState({currenticon: res.weather[0].icon.slice(0, -1)});
      this.setState({forecast3: res.weather[1].weather[0].icon.slice(0, -1)});
      this.setState({forecast6: res.weather[2].weather[0].icon.slice(0, -1)});
      this.setState({forecast9: res.weather[3].weather[0].icon.slice(0, -1)});

      this.updateMap();
    }
  }

  /**
   * Call and Run when 'pin' on map is dragend or user clicks on map
   */
   async otherSearch() {

    const respin = await getWeatherFromClick();

    this.setState({currenticon: respin.weather[0].icon.slice(0, -1)});
    this.setState({forecast3: respin.weather[1].weather[0].icon.slice(0, -1)});
    this.setState({forecast6: respin.weather[2].weather[0].icon.slice(0, -1)});
    this.setState({forecast9: respin.weather[3].weather[0].icon.slice(0, -1)});
    
    this.updateMap();
  }

  /**
   * Set map marker position and map pan settings
   */
  updateMap() {

    const position = new google.maps.LatLng(config.latitude, config.longitude);
 
    /// Set a timeout before doing map stuff
    window.setTimeout( function() {
      
      /// Set the marker position
      marker.setPosition(position);
      
      /// Pan map to that position
      map.panTo(position);
    }.bind(this), 300);
  }

  /**
   * Called after that the page is rendered
   */
  componentDidMount(){

    this.renderMap();
  }

  /**
   * Called before that the page is rendered
   */
  async componentWillMount() {
    
    const res = await getWeatherFromPosition();
    //Get information from the response (current w and forecast every 3h + other info that can be taken)
    this.setState({currenticon: res.weather[0].icon.slice(0, -1)});
    this.setState({forecast3: res.weather[1].weather[0].icon.slice(0, -1)});
    this.setState({forecast6: res.weather[2].weather[0].icon.slice(0, -1)});
    this.setState({forecast9: res.weather[3].weather[0].icon.slice(0, -1)});

    this.updateMap();

  }

  render() {
    return (
      <div id="app">
        <div id="app__interface">
          <div className="panel panel-default">
            <div className="panel-heading text-center"><span className="text-muted">Enter a place name below, drag the marker <em>or</em> click directly on the map</span></div>
              <div className="panel-body">
                
                <form onSubmit={this.formSubmit}>
                    <div className="input-group pull-left">
                      <input type="text" className="form-control" placeholder="Enter a town/city name" ref="newLocation"/>
                      <span className="input-group-btn">
                        <button type="submit" className="btn btn-default" onClick={this.locationSearch}>Search</button>
                      </span>
                    </div>
                    
                </form>
              </div>
            <WeatherForecast currenticon={this.state.currenticon} forecast3={this.state.forecast3} forecast6={this.state.forecast6} forecast9={this.state.forecast9}/>
          </div>
        </div>
        <div id="map"></div>
      </div>
      );
    }

}

class WeatherForecast extends React.Component {

  render() {
    //const { currenticon } = this.state;
    //const { forecast3 } = this.state;
    //const { forecast6 } = this.state;
    //const { forecast9 } = this.state;

    return (
      <div className="panel-heading weather">
        
        <div className="weather__icon">
          <img src={this.props.currenticon} />
        </div>
      </div>
      );
  }
}

ReactDOM.render(
<WeatherMap />,
document.getElementById('mount-point')
);
