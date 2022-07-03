const io = require('socket.io')(process.env.PORT || 3000, { //8124 is the local port we are binding the pingpong server to
});
var usedID=[0]
var playerList=[];
var Player={
    ID:0,
    socketID:'',
    roomID:0000,
    lobbyID:0000,
    isReady:false,
    name:'',
    points:0,
    victories:0,
    defeats:0,
    lv:1,
    exp:0,
    heath:100,
    heathMax:100,
    inventory:[],
    bullIDList:[],
    selectedBullID:0000,
    pos:{
        x:0.0,
        y:0.0,
        z:0.0
    },
    rot:{
        x:0.0,
        y:0.0,
        z:0.0
    }
}
var weaponList=[];
var Weapon={
    ID:0,
    name:'',
    damage:30,
    ammo:30,
    ammoMax:30,
    fireRate:1
}
var GameMode={
    solo:{
        timerMax:90,
        penaltyTime:5,
        pointMax:15,
        playerMax:10
    }
}
var Room={
    ID:0,
    name:'',
    playerMax:10,
    playerList:[]
}
var Lobby={
    ID:0,
    name:'',
    playerList:[]
}
var roomList=[];
var lobbyList=[];

var serverInfo={
    playersOnline:0,
    roomsRunning:0,
}
//================================================================================
function GeneratorID(){
    ID=Math.floor(Math.random() * 9999);
    console.log("Getting ID...");
    while (usedID.includes(ID)) {
       ID=Math.floor(Math.random() * 9999);
    }
    console.log("New ID: "+ID)
    usedID.push(ID)
    return ID;
}

io.on('connection', (socket) => {

    //socket.join('room1');
    console.log("============================================================================================");
    console.log('Um novo player se conectou, socketID: '+socket.id);
    let ID = GeneratorID();
    let player = {...Player};
    player.socketID=socket.id;
    player.ID=ID;
    playerList.push(player)
    
    let lobby ={...Lobby};
    lobby.ID=ID;
    lobby.name=player.name;
    lobby.playerList=[]
    lobby.playerList.push(player);

    player.lobbyID=lobby.ID;
    
    lobbyList.push(lobby);
    let room ={...Room}
    

    console.log("============================================================================================");
    console.log('PlayerList('+playerList.length+'):');
    playerList.forEach(player => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log(JSON.stringify(player));
    });
    console.log("============================================================================================");
    console.log('LobbyList('+lobbyList.length+'):');
    lobbyList.forEach(lobby => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log(JSON.stringify(lobby));
    });
    console.log("============================================================================================");
    console.log('RoomList('+roomList.length+'):');
    roomList.forEach(room => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log(JSON.stringify(room));
    });
    
    //Atualiza numero de players online
    serverInfo.playersOnline=playerList.length;
    socket.emit("server_info",serverInfo);
    socket.broadcast.emit("server_info",serverInfo);

    socket.on('player_connect', (data) => {
        playerList.forEach(player => {
            if (player.socketID==socket.id) {
                player.bullIDList.push(data.bullIDList[0]);
                player.selectedBullID=data.selectedBullID;
                if (playerList.length==1) {
                    let room = {...Room};
                    room.ID=player.ID;
                    room.playerList=[];
                    room.playerList.push(player);
                    room.name=player.name+'_Room'
                    roomList.push(room);
                    player.roomID=room.ID;
                    socket.emit('player_joined_room',player)
                }
                else
                {
                    let isInRoom=false;
                    roomList.forEach(_room => {
                        if (_room.playerList.length < _room.playerMax) {
                            _room.playerList.forEach(pl => {
                                if (pl.ID==player.ID) {
                                    isInRoom=true;
                                }
                            });

                            if (!isInRoom) {
                                _room.playerList.push(player);
                                player.roomID=_room.ID;
                                socket.emit('player_joined_room',player)
                                socket.broadcast.emit('player_joined_room',player)
                            }
                        }
                    });
                }
                player.isReady=true;
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
                console.log(JSON.stringify(player));
                socket.emit('player_connected',player);
                socket.broadcast.emit('player_connected',player);
            }
        });

        console.log("============================================================================================");
        console.log('RoomList('+roomList.length+'):');
        roomList.forEach(room => {
            console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            console.log(JSON.stringify(room))
        });

    });
    socket.on('player_connect', (reason) => {


    });



	socket.on('disconnect', (reason) => {
        console.log("============================================================================================");
        console.log("Um player desconectou-se SocketID: "+socket.id);


        playerList.forEach(player => {
            console.log("============================================================================================");
            if (player.socketID==socket.id) {
                roomList.forEach(room => {
                    if (room.ID=player.ID) {
                        room.playerList.splice(player,1); 
                        if(room.playerList.length){
                            room.ID=room.playerList[0].ID;
                            console.log('Novo dono da room: '+JSON.stringify(player));                       
                            console.log('Room('+room.playerList.length+'): '+JSON.stringify(room));
                        } 
                        roomList.splice(room,1); 
                        return false;                       
                    }
                });

                console.log("============================================================================================");
                lobbyList.forEach(lobby => {
                    if (lobby.ID=player.ID) {
                        lobby.playerList.splice(player,1);
                        if(lobby.playerList.length){
                            lobby.ID=lobby.playerList[0].ID;
                            console.log('Novo dono do lobby: '+JSON.stringify(player));                       
                            console.log('Lobby('+lobby.playerList.length+'): '+JSON.stringify(lobby));

                        }
                        
                        lobbyList.splice(lobby,1); 
                        return false;                       
                    }
                });
                playerList.splice(player, 1);
                return false;
            }
        });

        // console.log("============================================================================================");
        // console.log('PlayerList('+playerList.length+'):' +JSON.stringify(playerList));
        // console.log("============================================================================================");
        // console.log('LobbyList('+lobbyList.length+'):' +JSON.stringify(lobbyList));
        // console.log("============================================================================================");
        // console.log('RoomList('+roomList.length+'):' +JSON.stringify(roomList));

        console.log("============================================================================================");
        console.log('PlayerList('+playerList.length+'):');
        playerList.forEach(player => {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
            console.log(JSON.stringify(player));
        });
        console.log("============================================================================================");
        console.log('LobbyList('+lobbyList.length+'):');
        lobbyList.forEach(lobby => {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
            console.log(JSON.stringify(lobby));
        });
        console.log("============================================================================================");
        console.log('RoomList('+roomList.length+'):');
        roomList.forEach(room => {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
            console.log(JSON.stringify(room));
        });

                //Atualiza numero de players online
                serverInfo.playersOnline=playerList.length;
                // socket.emit("server_info",serverInfo);
                socket.broadcast.emit("server_info",serverInfo);

	});

});

// App Code starts here
console.log('Server is running!');