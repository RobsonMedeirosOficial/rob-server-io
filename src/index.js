const { emit } = require('process');

const io = require('socket.io')(process.env.PORT || 3000, { //8124 is the local port we are binding the pingpong server to
});


var socketList=[]
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
    playerMax:2,
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
    //console.log("GeneratorID ============================================================================================");
    //console.log("Gerando ID...");
    while (usedID.includes(ID)) {
       ID=Math.floor(Math.random() * 9999);
    }
    //console.log("Novo ID: "+ID)
    usedID.push(ID)
    return ID;
}
function GetIndex(array, value){
    var index=undefined;

    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        if (element==value) {
            index=i;
            break;
        }
        
    }

    return index;
}

function DebugLog(title=''){
    console.log(title+" %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log("ROOMs ============================================================================================");
    roomList.forEach(room => {
        
        console.log("\nRoom: "+room.name+"(ID"+room.ID+")"+"("+room.playerList.length+")");
        room.playerList.forEach(player => {
            if (player.roomID == room.ID) {
                console.log("@@@@ Player: "+player.name+"(ID"+player.ID+")");
            }
            else{
                console.log(">>>> Player: "+player.name+"(ID"+player.ID+")");
            }
        });
    });

    console.log("PLAYERs ============================================================================================");
    playerList.forEach(player => {
        
        console.log("\nPlayer: "+player.name+"(ID"+player.ID+")"+"(RoomID: "+player.roomID+")");
    });
}

function Server_info(){
    serverInfo.playersOnline=playerList.length;
    serverInfo.roomsRunning=0;

    return serverInfo;

}

function GetPlayerFromID(ID){
    var p = undefined;
    playerList.forEach(player => {
        if (player.ID==ID) {
            p=player;
            return false;
        }
    });  
    return p;
}

function GetRoomFromID(ID){
    var r = undefined;
    roomList.forEach(room => {
        if (room.ID==ID) {
            r=room;
            return false;
        }
    });  
    return r;
}

function RemoveInactiveRoom(socket){
    roomList.forEach(room=>{
        var player=GetPlayerFromID(room.ID);

        if (!player && room.playerList.length<=0) {
            console.log("\n\nRemovendo inactive room: "+JSON.stringify(room));
            roomList.splice(GetIndex(roomList,room),1);
            socket.emit("room_remove",room);
            socket.broadcast.emit("room_remove",room);
        }
        

    })
}

function RoomUpdate(socket, deletID=''){
    roomList.forEach(room => {
        if(deletID=='') {
            

        }else{
            
            socket.emit("room_remove");
            socket.broadcast.emit("room_remove");
            return false;
        }

        console.log("ROOMs: "+roomList.length+"  =============================================");

    });
}

function CreateRoom(ID, name, playerMax){
    //console.log("CreateRoom ================================================");
    //console.log("ID: "+ID+"  Name: "+name+"  PlayerMax: "+playerMax);
    var r=undefined;
    if(!GetRoomFromID(ID)){
        let room = {...Room};
        //console.log("ROOM: "+JSON.stringify(room));
        room.ID=ID;
        room.name=name;
        room.playerMax=playerMax;
        roomList.push(room);
        r=room;
    }
    return r;
}

function JoinRoom(playerID,roomID, socket){

   
}

io.on('connection', (socket) => {

    console.log("\n\nconnection ============================================================================================");
    
    //#region 1) Preparação e integração do player ao servidor ----------------------------------------------------------------------
    // Primeiro verificamos se o socket.id está na scokeList se não estiver adicione e registre o player
    if (!socketList.includes(socket.id)) {
        socketList.push(socket.id);
        //console.log('Um novo player se conectou, socketID: ');
        console.log('\n\nUm novo player se conectou, socketID: '+socket.id);
        // Solicitar registro de dados do player
        socket.emit("player_register");
    }
    
    // Aqui vamos cadastrar o player e criar um lobby para ele
    socket.on('player_register', (data) => {
        console.log("\n\player_register  ===========================================================");
        console.log(data);

        if (socketList.includes(socket.id) && data.ID=='') {
            let ID = GeneratorID();
            let player = {...Player};
            player.socketID=socket.id;
            player.ID=ID;
            player.name=data.name;
            player.selectedBullID=data.selectedBullID;
            player.bullIDList=data.bullIDList;
            playerList.push(player);
            console.log("\n\nplayer_register ============================================================================================");
            console.log("O player: "+player.name+"("+player.ID+")"+" foi registrado.");
            socket.emit("successfully_registered",player)
            socket.emit("server_info",Server_info());
            socket.broadcast.emit("server_info",Server_info());


            // socket.emit("room_update",room);
            // socket.broadcast.emit("room_update",room);
        }
    });
    //#endregion
    

    socket.on('player_create_room', (data) => {
        console.log("\n\nplayer_create_room  ===========================================================");
        console.log(data);
        var room = GetRoomFromID(data.ID);
        var player = GetPlayerFromID(data.ID);

        if (!room && player) {
            room=data;
            // Minimo e maximo de player correção
            if(room.playerMax>10){
                room.playerMax=10;
            }
            if(room.playerMax<2){
                room.playerMax=2;
            }
            roomList.push(room)
            socket.emit("room_update",room);
            socket.broadcast.emit("room_update",room);

            
        }

        console.log("\nNOVA ROOM, ROOMLIST: "+roomList.length);
        console.log(room);

    });


    socket.on('player_join_room', (data) => {
        console.log("\n\nplayer_join_room  ===========================================================");
        console.log(data);
        var room = GetRoomFromID(data.roomID);
        var player = GetPlayerFromID(data.playerID);
        var roomPlayerList = [];
        var room2;







        if(room){
            roomPlayerList = room.playerList;
        }

        if (player && room  && roomPlayerList.length < room.playerMax) {
            
            roomList.forEach(rm => {
                if (rm!=room && rm.playerList.includes(player.ID)) {
                    room2 = rm;
                }
            });


            if (!roomPlayerList.includes(player.ID)) {
                roomPlayerList.push(player.ID);
                if(room2){
                    room2.playerList.splice(GetIndex(room2.playerList,player.ID),1);
                }
                
            }

        }

        if(room2){
            socket.emit("room_update",room2);
            socket.broadcast.emit("room_update",room2);
        }

        socket.emit("room_update",room);
        socket.broadcast.emit("room_update",room);


        //socket.emit("player_room_update",player);
        //socket.broadcast.emit("room_update",player);


    });
    
    socket.on('player_update_rooms', (data) => {
        console.log("\n\nplayer_update_rooms  ===========================================================");
        console.log(data);
        
        roomList.forEach(room => {
            socket.emit("room_update",room);
        });

    });




	socket.on('disconnect', (reason) => {
        console.log("\n\ndisconnect ============================================================================================");
        console.log("Desconexão SocketID: "+socket.id);
        var player;
        var room;
        playerList.forEach(pl => {
            if (pl.socketID==socket.id) {
                player = pl;
                return false
            }
        });

        if(player){
            console.log("O player: "+player.name+"("+player.ID+")"+" foi desconectado.");
            playerList.splice(GetIndex(playerList,player),1)
            socketList.splice(GetIndex(socketList,socket.id),1)

            roomList.forEach(room => {
                if (room.playerList.includes(player.ID)) {
                    room.playerList.splice(GetIndex(room.playerList,player.ID),1);
                    socket.emit("room_update",room);
                    socket.broadcast.emit("room_update",room);
                }
            })
        }

        RemoveInactiveRoom(socket);

        socket.emit("server_info",Server_info());
        socket.broadcast.emit("server_info",Server_info());
    });


});

// App Code starts here
console.log('Server is running!');