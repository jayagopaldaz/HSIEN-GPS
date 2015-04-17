var ws;

var temp;
function initWs(){
  ws=new WebSocket('ws://72.182.78.244:8787');
  ws.onopen=function(){ console.log('open'); }
  ws.onclose=function(){ console.log('close'); }
  ws.onmessage=function(msg){ 
    var dat=msg.data.split(',');
    if(dat[0]=='lose'){
      playSet=false;
      flagSet=false;
      line.style.display="none"; 
      play.innerHTML='<p>Play</p>';
      pin.innerHTML='<p>Pin Flag</p>';
      alert("You LOSE!");
    }
    if(dat[0]=='flag'){
      if(dat[1]=='true'){ flagSet=true; flagPos.lat=Number(dat[2]); flagPos.lng=Number(dat[3]); }
      else flagSet=false;
      pin.innerHTML=(flagSet ? '<p>Unpin Flag</p>' : '<p>Pin Flag</p>')
    }
    if(dat[0]=='play'){
      if(dat[1]=='true') playSet=true;
      else playSet=false;
      play.innerHTML='<p>Play</p>';
    }
    console.log(dat); 
  }
}