var ws;

function initWs(){
  ws=new WebSocket('ws://72.182.78.244:8787');
  ws.onopen=function(){ console.log('open'); }
  ws.onclose=function(){ console.log('close'); }
  ws.onmessage=function(msg){ 
    var dat=msg.data.split(',');
    
    switch(dat[0]){
      case 'lose':
        playSet=false;
        flagSet=false;
        line.style.display="none"; 
        play.innerHTML='<p>Play</p>';
        pin.innerHTML='<p>Pin Flag</p>';
        alert("You LOSE!");
      break;
    
      case 'flag':
        if(dat[1]=='true'){ flagSet=true; flagPos.lat=Number(dat[2]); flagPos.lng=Number(dat[3]); }
        else flagSet=false;
        pin.innerHTML=(flagSet ? '<p>Unpin Flag</p>' : '<p>Pin Flag</p>')
      break;
    
      case 'play':
        if(dat[1]=='true') playSet=true;
        else playSet=false;
        opp[dat[4]]={lat:Number(dat[2]),lng:Number(dat[3])};
        play.innerHTML='<p>Play</p>';
      break;
      
      case 'close':
        delete opp[dat[1]];
      break;
      
      case 'mode':
        flagSet=dat[1]=="true";
        playSet=dat[2]=="true";
        if(flagSet){ flagPos.lat=Number(dat[3]); flagPos.lng=Number(dat[4]); }
        play.innerHTML='<p>Play</p>';
        pin.innerHTML=(flagSet ? '<p>Unpin Flag</p>' : '<p>Pin Flag</p>')
      break;
      
      case 'opps':
        for(var i=1; i<dat.length; i+=3) opp[dat[i]]={lat:Number(dat[i+1]),lng:Number(dat[i+2])};
      break;
    }
    
    console.log(dat); 
  }
}