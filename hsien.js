process.on("uncaughtException", function(err){ console.log(err); });

var net = require('net');
var serv = net.createServer(onRequest_SOCKET).listen(8787, "192.168.0.222");
var shook=false;
var socket=[];
var opp=[];
var pinned=false;
var playing=false;
var flagLat=0;
var flagLng=0;
opp={};

var closebuf = new Buffer([0x88, 0x82]);

function onRequest_SOCKET(sock){
  console.log('Connection: '+sock.remoteAddress+':'+sock.remotePort);
  socket[sock.remoteAddress+':'+sock.remotePort]=sock;
  
  sock.on('data', function(data){
    if(shaking(data)){
      var magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
      var secWsKey = getKey(data.toString());
      var hash = require('crypto').createHash('SHA1').update(secWsKey + magicString).digest('base64');
      
      msg="HTTP/1.1 101 Switching Protocol Handshake\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n";
      msg+="Sec-WebSocket-Accept: " + hash + "\r\n\r\n";
      shook=true;
      sock.write(msg);
      sock.write(encodeDat(['mode',pinned,playing,flagLat,flagLng].join()));
      console.log("hand shook");
      
      oppStr="opps";
      for(var i in opp) oppStr+=","+i+","+opp[i].lat+","+opp[i].lng;
      console.log(oppStr);
      sock.write(encodeDat(oppStr));
    }
    else{
      id=sock.remoteAddress+':'+sock.remotePort
      dat = decodeDat(data).split(',');
      
      if(data[0]==closebuf[0] && data[1]==closebuf[1]){ 
        console.log(id, 'is closing');
        delete socket[id];
        delete opp[id];
        dat=['close'];
      }
      
      dat[dat.length]=id;
      if(dat[0]=='play'){
        opp[id]={lat:dat[2],lng:dat[3]};
        if(dat[1]=='true') playing=true;
        else playing=false;
      }
      if(dat[0]=='flag'){
        if(dat[1]=='true'){
          pinned=true;
          flagLat=dat[2];
          flagLng=dat[3];
        }
        else pinned=false;
      }
      
      for(i in socket){
        if(i==id) continue;
        console.log('writing',dat,'to',i);
        switch(dat[0]){
          case 'win': socket[i].write(encodeDat('lose')); break;
          case 'flag': socket[i].write(encodeDat(dat.join())); break;
          case 'play': socket[i].write(encodeDat(dat.join())); break;
          case 'close': socket[i].write(encodeDat(dat.join())); break;
        }
      }
    }
  });
  
  sock.on('close', function(data){ 
    for(i in socket){
      if(!socket[i]._handle){
        console.log(i, 'was closed!');
        delete socket[i];
        delete opp[i];
        dat=['close',i];
        for(j in socket){
          console.log('writing',dat,'to',j);
          socket[j].write(encodeDat(dat.join()));
        }
      }
    }
  });
}

function shaking(dat){
  return dat.toString().substr(0,3)=="GET";
}

function getKey(dat){
  field="Sec-WebSocket-Key: ";
  p1=dat.indexOf(field)+field.length;
  p2=dat.indexOf("\r\n",p1);
  return dat.substr(p1,p2-p1);
}

function encodeDat(bytesr){
  var bytesf = [];
  bytesf[0] = 129;
  if(bytesr.length <= 125){
    bytesf[1] = bytesr.length;
  } else if(bytesr.length >= 126 && bytesr.length <= 65535){
    bytesf[1] = 126;
    bytesf[2] = ( bytesr.length >> 8 ) & 255;
    bytesf[3] = ( bytesr.length      ) & 255;
  } else{
    bytesf[1] = 127;
    bytesf[2] = ( bytesr.length >> 56 ) & 255;
    bytesf[3] = ( bytesr.length >> 48 ) & 255;
    bytesf[4] = ( bytesr.length >> 40 ) & 255;
    bytesf[5] = ( bytesr.length >> 32 ) & 255;
    bytesf[6] = ( bytesr.length >> 24 ) & 255;
    bytesf[7] = ( bytesr.length >> 16 ) & 255;
    bytesf[8] = ( bytesr.length >>  8 ) & 255;
    bytesf[9] = ( bytesr.length       ) & 255;
  }
  for(var i = 0; i < bytesr.length; i++){ bytesf.push(bytesr.charCodeAt(i)); }
  return new Buffer(bytesf);
}

function decodeDat(data){
  var datalength = data[1] & 127;
  var indexFirstMask = 2;
  if(datalength == 126) indexFirstMask = 4;
  else if(datalength == 127) indexFirstMask = 10;
  var masks = data.slice(indexFirstMask,indexFirstMask + 4);
  var i = indexFirstMask + 4;
  var index = 0;
  var output = "";
  while(i < data.length){ output+=String.fromCharCode(data[i++] ^ masks[index++ % 4]); }
  return output;
}