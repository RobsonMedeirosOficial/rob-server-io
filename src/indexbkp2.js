const io = require('socket.io')(process.env.PORT || 4000, { //8124 is the local port we are binding the pingpong server to
  pingInterval: 30005,		//An interval how often a ping is sent
  pingTimeout: 5000,		//The time a client has to respont to a ping before it is desired dead
  upgradeTimeout: 3000,		//The time a client has to fullfill the upgrade
  allowUpgrades: true,		//Allows upgrading Long-Polling to websockets. This is strongly recommended for connecting for WebGL builds or other browserbased stuff and true is the default.
  cookie: false,			//We do not need a persistence cookie for the demo - If you are using a load balöance, you might need it.
  serveClient: true,		//This is not required for communication with our asset but we enable it for a web based testing tool. You can leave it enabled for example to connect your webbased service to the same server (this hosts a js file).
  allowEIO3: false,			//This is only for testing purpose. We do make sure, that we do not accidentially work with compat mode.
  cors: {
    origin: "*"				//Allow connection from any referrer (most likely this is what you will want for game clients - for WebGL the domain of your sebsite MIGHT also work)
  }
});

const playerInfoMP={
  socketID:"",
  player:"",
  name:"",
  pos:{x:0.0,y:0.0,z:0.0},
  rot:{x:0.0,y:0.0,z:0.0},
  pitch:0.0


}

let playerInfoMP_Movement={
  socketID:"",
  pos:{x:0.0,y:0.0,z:0.0},
  rot:0.0,
  pitch:0.0

}

const playerList=[]
















//setTimeout(0);
io.on('connection', (socket) => {
	
  time=1;
  function update() {
    
    
    if (playerList.length>0) {
      console.log("Enviando msg: "+time);
      for (let i = 0; i < playerList.length; i++) {
        const data = playerList[i];
        socket.broadcast.emit("PosRotPitchUpdate",data);
      }
      
    }
    time++;
    if (time>59) {
      time=0
    }
    setTimeout(update, 1);
  }


  update();
    socket.on('server_key_pressed', (data) => {
      console.log('Received: ' + data);	

      socket.emit('client_key_pressed', 'server send: Space is pressed');
      
    });
    
    socket.on('PosRotPitchUpdate', (data) => {

      for (let i = 0; i < playerList.length; i++) {
        if (playerList[i].socketID==socket.id) {
          playerList[i].pos=data.pos;
          playerList[i].rot=data.rot;
          playerList[i].pitch=data.pitch;

        }

      }

      
      
    });

    // Player se conecta e é registrado --------------------------------------------------
    socket.on('connect_player', (data) => {
      //console.log('Received: ' + JSON.stringify(data));	
      // let player= playerInfoMP;
      // player.socketID=socket.id;
      data.socketID=socket.id;

      let playerInList=false;


      if(playerInList){
        console.log("Player: "+data.name+" já está na partida!");
      }else{
        playerList.push(data)
        console.log("Player: "+data.name+" entrou na partida!");
      }
      

      


      console.log("*************************************************************");
      console.log("Player list amount: "+playerList.length);
      for (let i = 0; i < playerList.length; i++) {
        
        socket.emit('player_connected', playerList[i]);
        socket.broadcast.emit('player_connected', data);
        console.log("Player: "+playerList[i].name);
        
      }

    });

  //Ao desconectar --------------------------------------------------------------
	socket.on('disconnect', (reason) => {
    console.log("*************************************************************");
    console.log("Alguém foi desconectado, verificando...");
    socket.broadcast.emit('remove_player',""+socket.id);
    for (let i = 0; i < playerList.length; i++) {
      if (playerList[i].socketID==socket.id) {
        console.log("Player: "+playerList[i].name+"   |   SocketID: "+playerList[i].socketID);
        
        playerList.splice(i, 1);
      }
      
      
    }
   
    console.log("Player list amount: "+playerList.length);

		//console.log('[' + (new Date()).toUTCString() + '] ' + socket.id + ' disconnected after ' + cnt + ' pings. Reason: ' + reason);
	});

});

console.log('Server is running!');


