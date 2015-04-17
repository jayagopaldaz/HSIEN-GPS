process.on("uncaughtException", function(err){ console.log(err); });

var net = require('net');
var serv = net.createServer(onRequest_SOCKET).listen(8787, "192.168.0.222");
var shook=false;
var sockID=[];
var closebuf = new Buffer([0x88, 0x82, 0x09, 0xd2, 0xd0, 0x6d, 0x0a, 0x3b]);

function onRequest_SOCKET(sock){
  console.log('Connection: ' + sock.remoteAddress +':'+ sock.remotePort);
  sockID[sock.remoteAddress+':'+sock.remotePort]=sock;
  
  sock.on('data', function(data){
    if(shaking(data)){
      var magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
      var secWsKey = getKey(data.toString());
      var hash = require('crypto').createHash('SHA1').update(secWsKey + magicString).digest('base64');
      
      msg="HTTP/1.1 101 Switching Protocol Handshake\r\n";
      msg+="Upgrade: websocket\r\n";
      msg+="Connection: Upgrade\r\n";
      msg+="Sec-WebSocket-Accept: " + hash + "\r\n\r\n";
      shook=true;
      sock.write(msg);
      console.log("handshook");
    }
    else{
      dat = decodeDat(data).split(',');
      id=sock.remoteAddress+':'+sock.remotePort
      for(i in sockID){
        if(i==id) continue;
        if(data.toString()==closebuf.toString) console.log(i, 'is closing');
        if(dat[0]=='flag'){
          console.log('writing',dat,'to',i);
          sockID[i].write(encodeDat(dat.join()));
        }
        if(dat[0]=='play'){
          console.log('writing',dat,'to',i);
          sockID[i].write(encodeDat(dat.join()));
        }
        if(dat[0]=='win'){
          console.log('win');
          sockID[i].write(encodeDat('lose'));
        }
      }
    }
  });
  
  sock.on('close', function(data){ 
    for(i in sockID){
      if(!sockID[i]._handle){
        console.log(i, 'was closed!');
        delete sockID[i];
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

function encodeDat(bytesRaw){
    var bytesFormatted = [];
    bytesFormatted[0] = 129;
    if (bytesRaw.length <= 125) {
        bytesFormatted[1] = bytesRaw.length;
    } else if (bytesRaw.length >= 126 && bytesRaw.length <= 65535) {
        bytesFormatted[1] = 126;
        bytesFormatted[2] = ( bytesRaw.length >> 8 ) & 255;
        bytesFormatted[3] = ( bytesRaw.length      ) & 255;
    } else {
        bytesFormatted[1] = 127;
        bytesFormatted[2] = ( bytesRaw.length >> 56 ) & 255;
        bytesFormatted[3] = ( bytesRaw.length >> 48 ) & 255;
        bytesFormatted[4] = ( bytesRaw.length >> 40 ) & 255;
        bytesFormatted[5] = ( bytesRaw.length >> 32 ) & 255;
        bytesFormatted[6] = ( bytesRaw.length >> 24 ) & 255;
        bytesFormatted[7] = ( bytesRaw.length >> 16 ) & 255;
        bytesFormatted[8] = ( bytesRaw.length >>  8 ) & 255;
        bytesFormatted[9] = ( bytesRaw.length       ) & 255;
    }
    for (var i = 0; i < bytesRaw.length; i++){
        bytesFormatted.push(bytesRaw.charCodeAt(i));
    }
    return new Buffer(bytesFormatted);
}

function decodeDat(data){
    var datalength = data[1] & 127;
    var indexFirstMask = 2;
    if (datalength == 126) {
        indexFirstMask = 4;
    } else if (datalength == 127) {
        indexFirstMask = 10;
    }
    var masks = data.slice(indexFirstMask,indexFirstMask + 4);
    var i = indexFirstMask + 4;
    var index = 0;
    var output = "";
    while (i < data.length) {
        output += String.fromCharCode(data[i++] ^ masks[index++ % 4]);
    }
    return output;
}