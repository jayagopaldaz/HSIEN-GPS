var myPos, flagPos;
var watchId;
var map;
var targ,self;
var zoomed=false;
var flagSet=false;
var playSet=false;
var line;

var app = {
  initialize: function() { this.bindEvents(); },
  bindEvents: function() { document.addEventListener('deviceready', this.onDeviceReady, false); },
  onDeviceReady: function() { app.receivedEvent('deviceready'); init(); },
  receivedEvent: function(id) {  console.log('Received Event: ' + id);  }
};

function init(){
  targ=document.getElementById('targ');
  self=document.getElementById('self');
  line=document.getElementById('line');

  watchId = navigator.geolocation.watchPosition( processGeolocation, geolocationError, { timeout: 30000, enableHighAccuracy: true, maximumAge: 3000 } ); 
  //navigator.geolocation.clearWatch(watchID);
  
  window.addEventListener("deviceorientation", function (e) {
    dir=360-e.alpha-45;
    //self.style.transform="rotate("+dir+"deg)";
    self.style.transform=self.style['-webkit-transform']="rotate("+dir+"deg)";
  }, false);

  L.mapbox.accessToken = 'pk.eyJ1IjoiamF5YWdvcGFsIiwiYSI6IjhJdmoyNTAifQ.aJ31ee0IFzVsDVJrR_nsPg';
  map = L.mapbox.map('map', 'jayagopal.llm4817k');
  setInterval(function(){ document.getElementById('geolocation2').innerHTML='CURRENT TIME:' + prettyTime(Date.now()) + '<br />'; }, 1000);
  setInterval(function(){ 
    if(zoomed){
      if(!flagSet) flagPos=map.getCenter();
      targxy=map.latLngToContainerPoint(flagPos);
      targ.style.left=targxy.x+"px";
      targ.style.top=targxy.y+"px";
      
      selfxy=map.latLngToContainerPoint(myPos);
      self.style.left=selfxy.x+"px";
      self.style.top=selfxy.y+"px";
      
      if(document.getElementById('map').firstChild.firstChild.firstChild.firstChild.style.cssText){
        targ.style.display="none"; 
        self.style.display="none"; 
        line.style.display="none"; 
      }
      else{
        targ.style.display="inline";
        self.style.display="inline";
        line.style.display="inline";
      }
      
      if(flagSet) document.getElementById('play').style.color="#000";  
      else document.getElementById('play').style.color="#aaa";
      if(playSet) document.getElementById('pin').style.color="#aaa";  
      else document.getElementById('pin').style.color="#000";
      
      if(playSet){
        gap=Math.round(latlngToMeters(myPos,flagPos));
        document.getElementById('play').innerHTML="<p>"+gap+"m</p>";
        if(gap<10){
          playSet=false;
          line.style.display="none"; 
          alert("You WON!!!");
          document.getElementById('play').innerHTML='<p>Play</p>';
        }
        
        gw=targxy.x-selfxy.x;
        gh=targxy.y-selfxy.y;
        gapAng=Math.atan2(gh, gw);
        gapPx=Math.floor(Math.sqrt(gw*gw+gh*gh));
        line.style.width=gapPx+"px";
        line.style.transform=line.style['-webkit-transform']="translate("+(selfxy.x+1)+"px, "+(selfxy.y+1)+"px) rotate("+gapAng+"rad)";
      }
      else{
        line.style.display="none"; 
      }
    }
  }, 10);
}

function processGeolocation(pos) {
  document.getElementById('geolocation').innerHTML = 
    'LATITUDE: '          + (pos.coords.latitude        !=null ? pos.coords.latitude.toFixed(5)         + '&deg;' : "-") + '<br />' +
    'LONGITUDE: '         + (pos.coords.longitude       !=null ? pos.coords.longitude.toFixed(5)        + '&deg;' : "-") + '<br />' +
    'ALTITUDE: '          + (pos.coords.altitude        !=null ? Math.floor(pos.coords.altitude)        + 'm'     : "-") + '<br />' +
    'ACCURACY: '          + (pos.coords.accuracy        !=null ? pos.coords.accuracy.toFixed(2)         + 'm'     : "-") + '<br />' +
    'ALTITUDE ACCURACY: ' + (pos.coords.altitudeAccuracy!=null ? pos.coords.altitudeAccuracy.toFixed(2) + 'm'     : "-") + '<br />' +
    'HEADING: '           + (pos.coords.heading!=NaN && pos.coords.headin!=null ? pos.coords.heading.toFixed(1) + '&deg;' : "-") + '<br />' +
    'SPEED: '             + (pos.coords.speed           !=null ? pos.coords.speed.toFixed(2)            + 'mph'   : "-") + '<br />' +
    'TIMESTAMP:'          + prettyTime(pos.timestamp) + '<br />';
  myPos={lat:pos.coords.latitude,lng:pos.coords.longitude};
  if(!zoomed){
    map.setView(myPos,5);
    zoomed=true;
    setTimeout(function(){ map.setZoom(19) }, 1500);
  }
}

function geolocationError(error){}
function prettyTime(d){ d=new Date(d); return d.toTimeString().split(" ")[0]; }

if(document.URL=="http://127.0.0.1/HSIEN-GPS/www/"){ console.clear(); window.onload=init; }

function latlngToMeters(pos1, pos2) {var R = 6371000; // metres
  lat1=pos1.lat;
  lon1=pos1.lng;
  lat2=pos2.lat;
  lon2=pos2.lng;
  
  var f1 = lat1.toRadians();
  var f2 = lat2.toRadians();
  var dlat = (lat2-lat1).toRadians();
  var dlon = (lon2-lon1).toRadians();

  var a = Math.sin(dlat/2) * Math.sin(dlat/2) +
          Math.cos(f1) * Math.cos(f2) *
          Math.sin(dlon/2) * Math.sin(dlon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c;
  
  return d;
}

if (typeof(Number.prototype.toRadians) === "undefined") {
  Number.prototype.toRadians = function() {
    return this * Math.PI / 180;
  }
}