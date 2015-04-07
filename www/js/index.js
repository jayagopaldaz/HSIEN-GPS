var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
    init();
    setInterval(function(){ if(myPos && map) map.setView([myPos.x, myPos.y], 30); }, 100);
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  }
};

var watchId;
var map;
function init(){
  try{
    watchId = navigator.geolocation.watchPosition(
      processGeolocation,
      geolocationError,
      { timeout: 30000, enableHighAccuracy: true, maximumAge: 3000 }
    );
    //navigator.geolocation.clearWatch(watchID);
  }
  catch(e){ alert(e); }
  
  try{
    L.mapbox.accessToken = 'pk.eyJ1IjoiamF5YWdvcGFsIiwiYSI6IjhJdmoyNTAifQ.aJ31ee0IFzVsDVJrR_nsPg';
    map = L.mapbox.map('map', 'jayagopal.llm4817k');
  }
  catch(e){ alert(e); }
}

//onSuccess Geolocation
var myPos;
function processGeolocation(pos) {
  var element = document.getElementById('geolocation');
  element.innerHTML = 
    'Latitude: '          + pos.coords.latitude         + '<br />' +
    'Longitude: '         + pos.coords.longitude        + '<br />' +
    'Altitude: '          + pos.coords.altitude         + '<br />' +
    'Accuracy: '          + pos.coords.accuracy         + '<br />' +
    'Altitude Accuracy: ' + pos.coords.altitudeAccuracy + '<br />' +
    'Heading: '           + pos.coords.heading          + '<br />' +
    'Speed: '             + pos.coords.speed            + '<br />' +
    'Timestamp:<br>'      + prettyTime(pos.timestamp)   + '<br />';
  map.setView([pos.coords.latitude, pos.coords.longitude], 30);
  myPos={x:pos.coords.latitude,y:pos.coords.longitude};
}

//onError Callback receives a PositionError object
function geolocationError(error) {
  //alert('code: ' + error.code  + '\n' + 'message: ' + error.message + '\n');
}

function prettyTime(d) {
  /*
  h = (d.getHours()<10?'0':'') + d.getHours(),
  m = (d.getMinutes()<10?'0':'') + d.getMinutes();
  return h + ':' + m;
  */
  //return d.toLocaleTimeString().replace("/.*(\d{2}:\d{2}:\d{2}).*/", "$1");
  return d.toTimeString().split(" ")[0];
}