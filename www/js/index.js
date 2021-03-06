var myPos, flagPos;
var watchId;
var map;
var targ,self,line,pin,play;
var zoomed=false;
var flagSet=false;
var playSet=false;
var opp=[];
var report=false;

if(document.URL=="http://127.0.0.1/HSIEN-GPS/www/"){ console.clear(); window.onload=init; }

var app = {
  initialize: function() { this.bindEvents(); },
  bindEvents: function() { document.addEventListener('deviceready', this.onDeviceReady, false); },
  onDeviceReady: function() { app.receivedEvent('deviceready'); init(); },
  receivedEvent: function(id) {  console.log('Received Event: ' + id);  }
};

function init(){
  initWs();
  
  targ=document.getElementById('targ');
  self=document.getElementById('self');
  line=document.getElementById('line');
  oppDiv=document.getElementById('opp');

  pin=document.getElementById('pin');
  play=document.getElementById('play');
  
  pin.onclick=function(){
    if(playSet) return; 
    flagSet=!flagSet; 
    ws.send(new Array(['flag',flagSet,flagPos.lat.toFixed(5),flagPos.lng.toFixed(5)]).join());
    this.innerHTML=(flagSet ? '<p>Unpin Flag</p>' : '<p>Pin Flag</p>')
  }
  
   play.onclick=function(){
     if(!flagSet) return; 
     playSet=!playSet; 
     ws.send(new Array(['play',playSet,myPos.lat.toFixed(5),myPos.lng.toFixed(5)]).join());
     //ws.send(new Array(['play',playSet]).join());
     this.innerHTML='<p>Play</p>';
   }

  
  watchId = navigator.geolocation.watchPosition( processGeolocation, geolocationError, { timeout: 30000, enableHighAccuracy: true, maximumAge: 3000 } ); 
  //navigator.geolocation.clearWatch(watchID);
  
  window.addEventListener("deviceorientation", function (e) {
    dir=360-e.alpha-45;
    //self.style.transform="rotate("+dir+"deg)";
    self.style.transform=self.style['-webkit-transform']="rotate("+dir+"deg)";
  }, false);

  L.mapbox.accessToken = 'pk.eyJ1IjoiamF5YWdvcGFsIiwiYSI6IjhJdmoyNTAifQ.aJ31ee0IFzVsDVJrR_nsPg';
  map = L.mapbox.map('map', 'jayagopal.llm4817k');

  setInterval(function(){ 
    if(zoomed){
      if(!flagSet) flagPos=map.getCenter();
      targxy=map.latLngToContainerPoint(flagPos);
      targ.style.left=targxy.x+"px";
      targ.style.top=targxy.y+"px";
      
      selfxy=map.latLngToContainerPoint(myPos);
      self.style.left=selfxy.x+"px";
      self.style.top=selfxy.y+"px";
      
      oppDiv.innerHTML="";
      for(var i in opp){
        oppxy=map.latLngToContainerPoint(opp[i]);
        style="left:"+oppxy.x+"px; ";
        style+="top:"+oppxy.y+"px; ";
        style+="top:"+oppxy.y+"px; ";
        oppDiv.innerHTML+="<div class=opp style='"+style+"'></div>";
      }
      
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
          flagSet=false;
          line.style.display="none"; 
          play.innerHTML='<p>Play</p>';
          pin.innerHTML='<p>Pin Flag</p>';
          ws.send('win');
          alert("You WON!!!");
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

setInterval(function(){
  if(report) return;
  try{ 
    ws.send(new Array(['play',playSet,myPos.lat.toFixed(5),myPos.lng.toFixed(5)]).join()); 
    report=true;
  }
  catch(e){}
},1000);

function processGeolocation(pos) {
  myPos={lat:pos.coords.latitude,lng:pos.coords.longitude};
  try{ ws.send(new Array(['play',playSet,myPos.lat.toFixed(5),myPos.lng.toFixed(5)]).join()); }
  catch(e){}
  
  if(!zoomed){
    map.setView(myPos,5);
    zoomed=true;
    setTimeout(function(){ map.setZoom(15) }, 1500);
  }
}

function geolocationError(error){}

function latlngToMeters(pos1, pos2) {
  var R = 6371000; // metres
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

if (typeof(Number.prototype.toRadians) === "undefined"){ Number.prototype.toRadians = function(){ return this * Math.PI / 180; } }