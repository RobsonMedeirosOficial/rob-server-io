const { clear } = require('console');
const { emit } = require('process');

const io = require('socket.io')(process.env.PORT || 3000, { //8124 is the local port we are binding the pingpong server to
});


var socketList=[]
var usedID=[0]
var playerList=[];
var roomList=[];

var wait1v1List=[];
var wait2v2List=[];
var wait4v4List=[];


var playerMatchList=[];
var matchRoomList=[];

var lobbyList=[];
var Player={
    ID:0,
    socketID:'',
    resource_link:"",
    roomID:0000,
    lobbyID:0000,
    isReady:false,
    name:'',
    points:0,
    victories:0,
    defeats:0,
    lv:1,
    exp:0,
    health:100,
    healthMax:100,
    inventory:[],
    bullIDList:[],
    selectedBullID:0000,
    isLoadedBull:false,
    isWaitingMatch:false,
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
    playerList:[],
    playerInfoList:[],
    isRunning:false
}
var Lobby={
    ID:0,
    name:'',
    playerList:[]
}

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



function EmitRoom(room){

}

function PlayersInRoom(socket){
    //let playersInRoom=0;
    console.log("\n");
    console.log("("+new Date(Date.now())+")");
    console.log("Buscando em cada room o numero de players...");
    roomList.forEach(room => {
        let playersInRoom = room.playerList.length;

        var roomLength = {
            ID:0,
            playerList:[],
            playersInRoom:0
        }

        roomLength.ID=room.ID;
        roomLength.playersInRoom=playersInRoom;
        console.log(">>>> Room: "+room.name+"("+room.ID+")"+" playersInRoom: "+playersInRoom);
        socket.emit("players_in_room",roomLength)
        socket.broadcast.emit("players_in_room",roomLength)
    });
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
        //var player=GetPlayerFromID(room.ID);
        // if (!player && room.playerList.length<=0) {
        if (room.playerList.length<=0) {
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

function UpdatePlayersInRoom(room){
    let playerList=[];
    if(room){
        
        room.playerList.forEach(ID=>{
            player = GetPlayerFromID(ID);
            if(player && !playerList.includes(player) ){
                playerList.push(player);
            }
        })
    }
    var pList = {
        ID:0,
        playerList:[]
    }
    if(playerList.length>0){
        playerList.forEach(player => {
            pList.ID=room.ID;
            pList.playerList=playerList;
            io.to(pla.socketID).emit('room_player_list', pList);
        });
    }
}

function StartGame(room){
    isLoadedBull=True;
    room.playerList.forEach(p => {
        if (!p.isLoadedBull) {
            isLoadedBull=false;
        }
    });

    if(isLoadedBull){

    }
}


function StartMatch(room) {
    isAllReady = true;

    room.playerList.forEach(player=>{
        if(!player.isReady){
            console.log("\n");
            console.log("("+new Date(Date.now())+")");
            console.log("A partida foi cancelada!");
            isAllReady=false;
            return false;
        }
    })

    if(isAllReady){

        // room.playerList.forEach(p => {
        //     io.socket(p.socketID).join(room.ID);
        // });

        // room.playerList.forEach(player=>{

        //     io.to(player.socketID).emit('start_match');
        // })

        
        io.to(room.ID).emit("start_match");
        
        console.log("\n");
        console.log("("+new Date(Date.now())+")");
        console.log("A partida começou!");

        setTimeout(() => {
            console.log("\n");
            console.log("("+new Date(Date.now())+")");
            console.log("A room: "+room.name+"("+room.ID+")"+" terminou a partida!");
          }, 10000)
    }
}


function GetSocketBySocketID(socketID){
    socket = null;
    socketList.forEach(s => {
        if(s.id==socketID){
            socket=s;
        }
    });

    return socket;
}




var base_link="https://rmoproducoes.com.br/chaves/";

io.on('connection', (socket) => {

    console.log("\n\nconnection ============================================================================================");
    //#region Primeiro contato com o socket 
    // Primeiro verifica se o socket.id está na scokeList se não estiver adicione e registre o player
    if (!socketList.includes(socket)) {
        socketList.push(socket);
        console.log('\n\nUm novo player se conectou, socketID: '+socket.id);
        // Solicitar registro de dados do player
        socket.emit("player_register");
    }
    //#endregion --------------------------------------------------------------------------------------
    
    // Registra o player -------------------------------------------------------------------------
    socket.on('player_register', async(data) => {
        console.log("\n");
        console.log("("+new Date(Date.now())+")");
        console.log("player_register  ===========================================================");
        console.log(data);

        if (socketList.includes(socket) && data.ID=='') {
            let ID = GeneratorID();
            let player = {...Player};
            player.socketID=socket.id;
            player.ID=ID;
            player.name=data.name;
            player.selectedBullID=data.selectedBullID;
            player.bullIDList=data.bullIDList;


            // player.health=100;
            // player.healthMax=100;
            //console.log("HEALTH: "+JSON.stringify(player));

            player.resource_link=base_link+player.name.replace(" ","_").toLowerCase()+".png";

            playerList.push(player);

            //console.log("\nplayer_register ============================================================================================");
            console.log("O player: "+player.name+"("+player.ID+")"+" foi registrado.");
            socket.emit("successfully_registered",player)

            socket.emit("server_info",Server_info());
            socket.broadcast.emit("server_info",Server_info());


        }
    });
    

    socket.on('player_create_room', (data) => {
        console.log("\n");
        console.log("("+new Date(Date.now())+")");
        console.log("player_create_room  ===========================================================");
        console.log(data);
        var room = GetRoomFromID(data.ID);
        var player = GetPlayerFromID(data.ID);

        // Verifica se o player existe e se não existe a room
        if (!room && player) {
            room=data;
            // Minimo e maximo de player correção
            if(room.playerMax>10){
                room.playerMax=10;
            }
            if(room.playerMax<2){
                room.playerMax=2;
            }
            // Adiciona a room na lista de room
            if(!roomList.includes(room)){
                roomList.push(room)
            }

            //NOVO ------------------------
            room.playerList.push(player);

            // atualiza para este socket e para todos os sockets online o estatus desta room
            socket.emit("player_create_room",room);
            socket.broadcast.emit("player_create_room",room);
            socket.emit("room_update",room);
            socket.broadcast.emit("room_update",room);
            
        }

        console.log("\nROOMLIST: "+roomList.length);
        console.log("\nUma nova room foi criada: "+room.name+"("+room.ID+")");
        //console.log(">>>> "+JSON.stringify(room));
        
        
        // Atualiza no client o numero de players na room
        PlayersInRoom(socket);

    });


    socket.on('player_join_room', (data) => {
        console.log("\n\n");
        console.log("("+new Date(Date.now())+")");
        console.log("player_join_room  ===========================================================");
        console.log(data);
        var room = GetRoomFromID(data.roomID);
        var player = GetPlayerFromID(data.playerID);
        var currentRoomID = data.currentRoomID;
        var lastRoom = undefined;
        var playersInRoom=[];
        var playerListRoom=[];
        // var roomPlayerList = [];
        // var room2;






        // Aqui validamos a entrada do player na room ----------------
        if (player && room  && room.playerList.length < room.playerMax) {
            let isInRoom=false;

            // // verifica se o player está na room
            // room.playerList.forEach(p =>{
            //     if(p==player){
            //         isInRoom=true;
            //         //console.log("O player: "+player.name+"("+player.ID+")"+" já está na room: "+room.name+"("+room.ID+")");
            //         return false;
            //     }
            // })


            // Se o player não estiver na room coloque-o lá
            if(room && player && !room.playerList.includes(player)){
                //console.log("\nO player : "+player.name+"("+player.ID+")"+" não está na room: "+room.name+"("+room.ID+")");
                // verifica se o player vem de outra room
                
                
                // roomList.forEach(rm => {
                //     rm.playerList.forEach(pl=>{
                //         if(pl.ID==player.ID){
                //             rm.playerList.forEach(pla => {
                //                 if (pla.ID!=player.ID) {
                //                     if(!playerListRoom.includes(pla)){
                //                         playerListRoom.push(pla);
                //                     }
                //                 }
                //             });
                //             console.log("\n");
                //             console.log("("+new Date(Date.now())+")");
                //             console.log("O player : "+player.name+"("+player.ID+")"+" saiu da room: "+rm.name+"("+rm.ID+")");
                //             // Remove o player da outra room no servidor
                //             lastRoom=rm;
                //             rm.playerList.splice(GetIndex(rm.playerList,player),1);
                //             return false
                //         }
                //     })
                // });

                // Busca em todas as rooms da roomList
                roomList.forEach(rm => {
                    // Se em uma room diferente desta room contiver o player em sua playerList, remova-o de lá
                    if(rm!=room && rm.playerList.includes(player)){
                        
                        rm.playerList.splice(GetIndex(rm.playerList,player),1)
                        var pList = {
                            ID:0,
                            playerList:[]
                        }
                        rm.playerList.forEach(p => {
                            pList.ID = rm.ID;
                            pList.playerList = rm.playerList;
                            io.to(p.socketID).emit('room_player_list', pList);
                            console.log("\n");
                            console.log("("+new Date(Date.now())+")");
                            console.log("O player cliente: "+p.name+"("+p.ID+")"+" receberá a playersInRoom: "+rm.playerList.length+" numeros de players");
                        });
                    }

                });

                // if (playerListRoom.length>0) {
                    
                //     var pList = {
                //         ID:0,
                //         playerList:[]
                //     }
                //     if(lastRoom){
                //         playerListRoom.forEach(play => {
                            
                //             pList.ID = lastRoom.ID;
                //             pList.playerList = playerListRoom;
                //             io.to(play.socketID).emit('room_player_list', pList);
                //             console.log("\n");
                //             console.log("("+new Date(Date.now())+")");
                //             console.log("O player cliente: "+play.name+"("+play.ID+")"+" receberá a playersInRoom: "+playerListRoom.length+" numeros de players");
                //         });

                //     }

                // }

                

                // adiciona o player na lista de players da room
                if(!room.playerList.includes(player)){
                    console.log("\n");
                    console.log("("+new Date(Date.now())+")");
                    console.log("O player : "+player.name+"("+player.ID+")"+" entrou na room: "+room.name+"("+room.ID+")");
                    console.log("HEALTH: "+JSON.stringify(player));
  
                    room.playerList.push(player);
                }
            }
        }

        var pList = {
            roomID:0,
            playerList:[]
        }

        if(room && room.playerList.length>0){
            room.playerList.forEach(p => {
                pList.roomID = room.ID;
                pList.playerList = room.playerList;
                io.to(p.socketID).emit('room_player_list', pList);
            });
        }
        // Atualiza no client o numero de players na room
        PlayersInRoom(socket);
    });
    
    // // Assim que um player for registrado atualize todos os players
    socket.on('player_update_rooms', (data) => {
        console.log("\n\n");
        console.log("("+new Date(Date.now())+")");
        console.log("player_update_rooms  ===========================================================");
        console.log(data);
        console.log("RoomList: "+roomList.length);
        roomList.forEach(room1 => {
            socket.emit("room_update",room1);
            console.log("room1: "+JSON.stringify(room1));
        });

        PlayersInRoom(socket);

    });

    socket.on('room_player_list_update',(data)=>{
        console.log("\n\n");
        console.log("("+new Date(Date.now())+")");
        console.log("room_player_list_update  ===========================================================");
        console.log(data);
        var room = GetRoomFromID(data.roomID);
        if (room) {
            room.playerList.forEach(pl =>{
                var player = GetPlayerFromID(pl);
                if (player) {
                    //console.log("\nAdicionando player: "+player.name+"("+player.ID+")"+" na room: "+room.name+"("+room.ID+")");

                    console.log("\nAdicionando player: "+JSON.stringify(player));
                    //socket.emit("player_room_update",player);
                }
            });

            UpdatePlayersInRoom(room);
        }
    })

    socket.on('player_is_ready',(data)=>{
        console.log("\n\n");
        console.log("("+new Date(Date.now())+")");
        console.log("player_is_ready  ===========================================================");
        console.log(data);

        // ready={
        //     playerID:0,
        //     roomID:0,
        //     isReady:false
        // }

        room = GetRoomFromID(data.roomID);
        player = GetPlayerFromID(data.playerID);

        if(room && player){
            socket.join(room.ID);
            player.isReady=data.isReady;

            if(player.isReady){
                console.log("O player: "+player.name+"("+player.ID+")"+"sinalizou que está preparado!");
            }else{
                console.log("O player: "+player.name+"("+player.ID+")"+" sinalizou que não está preparado!");
            }
            isAllReady=true;

            if(player.isReady){
                room.playerList.forEach(p=>{
                    if(!p.isReady){
                        isAllReady=false;
                        return false;
                    }
                })
            }

            if(isAllReady){
                console.log("\nA partida começará em 5 segundos!");
                //setTimeout(StartMatch(room), 5000);
                setTimeout(() => {
                    StartMatch(room);
                  }, 5000)
            }

        }

    });

    socket.on('player_is_loaded_bull',(data)=>{
        console.log("\n\n");
        console.log("("+new Date(Date.now())+")");
        console.log("player_is_loaded_bull  ===========================================================");
        console.log(data);

        // ready={
        //     playerID:0,
        //     roomID:0,
        //     isReady:false
        // }

        room = GetRoomFromID(data.roomID);
        player = GetPlayerFromID(data.playerID);


            if(room && player){
                
                player.isLoadedBull=data.isLoadedBull;

                if(player.isLoadedBull){
                    console.log("O player: "+player.name+"("+player.ID+")"+" sinalizou que os Bulls estão carregados!");
                // }else{
                //     console.log("O player: "+player.name+"("+player.ID+")"+" sinalizou que não está preparado!");
                // }
                isLoadedBull=true;

                if(player.isLoadedBull){
                    room.playerList.forEach(p=>{
                        if(!p.isLoadedBull){
                            isLoadedBull=false;
                            return false;
                        }
                    })
                }

                if(isLoadedBull){
                    console.log("\nTodos os Bulls de todos os players da room: "+room.name+"("+room.ID+")"+" estão carregados!");
                    io.to(data.roomID).emit("player_start_game");
                    //setTimeout(StartMatch(room), 5000);
                    // setTimeout(() => {
                    //     StartMatch(room);
                    // }, 5000);
                }

            }

        }   
    });

    //#region  GAMEPLAY UPDATE =======================================================================================
    socket.on('player_pos', async (data) => {
        //console.log(data);
        socket.to(data.roomID).emit("player_pos",data);
    });

    socket.on('player_shoot', (data) => {
        const d={
            roomID:0,
            playerID:0,
            point:{
                x:0.0,
                y:0.0,
                z:0.0
            }
        }
        room=GetRoomFromID(data.roomID);
        player=undefined;

        if(room){
            d.roomID=room.roomID;
            d.point=data.point;

            room.playerList.forEach(p => {
                if(p.socketID==socket.id){
                    d.playerID=p.ID;
                    player=GetPlayerFromID(d.playerID);
                }
            })
            io.to(data.roomID).emit("player_shoot",d);
        }
    });

    socket.on('player_hit', async (data) => {
        console.log("player_hit:  ========================================================");
        console.log(data);

        const d={
            roomID:0,
            hit_ID:0,
            shoot_ID:0,
            health:100
            
        }
        d.roomID=data.roomID;
        d.point=data.point;
        room=GetRoomFromID(data.roomID);
        player=undefined;
        playerHit=undefined;




        if(room){
            // d.roomID=room.roomID;

            room.playerList.forEach(p => {
                if(p.socketID==socket.id){
                    d.hit_ID=data.hit_ID;
                    d.shoot_ID=p.ID;

                    playerHit=GetPlayerFromID(d.hit_ID); //  melhorar esta função
                    if(playerHit){
                        playerHit.health-=30; // verificar damage da arma do player que atirou
                        if (playerHit.health<=0) {
                            playerHit.health=0;
                        }
                        d.health=playerHit.health
                        console.log('Player hitting =================: '+JSON.stringify(d));
                    }
                }
            })
            io.to(data.roomID).emit("player_hit",d);
            
            if (d.health==0) {
                io.to(data.roomID).emit("player_respawn",d);
                console.log('Player respawn =================: '+JSON.stringify(d));
            }

        }
    });

    socket.on('player_respawn', async (data) => {
        console.log('player_respawn: ========================================: \n'+JSON.stringify(data)+'\n');
        console.log(data);

        const d={
            roomID:0,
            playerID:0,
            health:0,
            healthMax:0
        }
        d.roomID=data.roomID;
        d.playerID = data.playerID;
        room=GetRoomFromID(data.roomID);
        //console.log('***** 1) player_revive: ' +JSON.stringify(d))



        if(room){

            room.playerList.forEach(p => {
                if(p.ID==d.playerID){
                    if (p.health <= 0) {

                        d.health = Player.healthMax;
                        d.healthMax = d.health;



                        //console.log('***** 3) player_revive: ' +JSON.stringify(d))
                        setTimeout(() => {
                            p.health = d.health;
                            p.healthMax = d.healthMax;
                            socket.to(d.roomID).emit("player_revive",d);
                            console.log("O player: "+p.name+"("+p.ID+")"+" reviveu! "+"(helth: "+p.health+")");
                            //console.log('***** 4) player_revive: ' +JSON.stringify(d))
                        }, 3000);
                        
                    }
                }
            })
            
        }



        
    });

    socket.on('player_rot', async (data) => {
    
        socket.to(data.roomID).emit("player_rot",data);
        
    });

    socket.on('player_anims', async(data) => {
        
        socket.to(data.roomID).emit("player_anims",data);

    });









//(evento) receber um evento de busca por partida com modo de jogo
    // adicionar o player na lista de espera do modo de jogo com um tempo de retorno
    //verifica na lista do modo de jogo a quantidade de jogadores ideal
        // no modo de jogo (1x1):
            // dividir em 2 times os 2 jogadores 
            //retornar o proximo evento
 
        // no modo de jogo (2x2):
            // dividir em 2 times os 4 jogadores
            //retornar o proximo evento


//(evento) retornar um evento de partida encontrada
    // aguardar retorno do proximo evento

//(evento) receber evento de todos os bulls carregados por jogador
    // verificar se todos os players tem os bulls carregados e retornar o proximo evento

//(evento) retornar evento de iniciar partida
    // iniciar gamemanger do modo de jogo
        // modo de jogo (1x1):
            //iniciar tempo de partida
            //iniciar verificação de pontos limite para ter um vencedor
            //verificar pontuação após terminar o tempo de partida
function FindMatchGameMode(player, list, playersAmount){
    // var list = wait1v1List;
    // var playersAmount = 1*2;

    if(player){
        if (list.length < playersAmount-1 && !list.includes(player)) {
            // adicionar o player na lista de espera do modo de jogo com um tempo de retorno
            console.log("\nO player: "+player.name+"("+player.ID+")"+" entrou na lista de espera.");
            list.push(player);
            return false;
           
        }else{
            //verifica na lista do modo de jogo a quantidade de jogadores ideal
            if(list.length = playersAmount-1){
                console.log("\nO player: "+player.name+"("+player.ID+")"+" começou uma partida (1x1).");
                let roomID = GeneratorID();
                let sock = GetSocketBySocketID(player.socketID);

                // Cria ar sala ao dar join
                sock.join(roomID);
                
                // pega a room IO pelo nome
                const rooms = io.of("/").adapter.rooms;
                const room = rooms.get(roomID)

                // Adiciona as keys na room
                room.ID=roomID;
                room.name="MatchRoom";
                room.playerMax=2;
                room.playerList=[];
                room.playerInfoList=[];
                room.isRunning=false;

                // Adiciona o player na playerList da room
                room.playerList.push(player);

                // Cria pacote
                var pList = {
                    roomID:0,
                    playerList:[]
                }

                // Preenche o pacote
                pList.roomID=roomID;
                pList.playerList.push(player);

                // Lista a list
                list.forEach(p => {
                    // Pega o socket do player listado
                    let sock2 = GetSocketBySocketID(p.socketID);
                    // O player listado entra na room
                    sock2.join(roomID);
                    console.log("\nO player: "+p.name+"("+p.ID+")"+" entrou na partida ("+(playersAmount/2)+"x"+(playersAmount/2)+"). da matchRoom("+room.ID+")");
                    // Adiciona o player listado na playerList da room
                    room.playerList.push(p);
                    // Adiciona o player listado na playerList da room
                    pList.playerList.push(p);

                    console.log("room.playerList amount: "+room.playerList.length);

                
                });

                // Reset list
                if(playersAmount==2){
                    wait1v1List=[];
                    console.log("wait1v1List amount: "+wait1v1List.length);
                }
                if(playersAmount==4){
                    wait2v2List=[];
                    console.log("wait2v2List amount: "+wait2v2List.length);
                }
                if(playersAmount==6){
                    wait4v4List=[];
                    console.log("wait4v4List amount: "+wait4v4List.length);
                }
                
                
                //(evento) retornar um evento de partida encontrada
                // Adicionar a room IO na roomList
                roomList.push(room);
                console.log("\n\n ROOM: ======================================================");
                console.log(room);
                // Envia para todos da room o pacote com a tag de evento start_match
                io.to(roomID).emit("start_match",pList);
            }
        }
    }
}


    socket.on('player_find_match', (data)=>{
        //data = playerID=int,gameMode=string
        var player = GetPlayerFromID(data.playerID);
        console.log("\nO player: "+player.name+"("+player.ID+")"+" iniciou uma busca por partida.");
        switch (data.gameMode) {
            case "1v1":
                FindMatchGameMode(player, wait1v1List, 1*2);
                break;
            case "2v2":
                FindMatchGameMode(player, wait1v1List, 2*2);
                break;
            case "4v4":
                FindMatchGameMode(player, wait1v1List, 3*2);
                break;
        
            default:
                break;
        }
        
            // no modo de jogo (1x1):
                // dividir em 2 times os 2 jogadores 
                //retornar o proximo evento
    
            // no modo de jogo (2x2):
                // dividir em 2 times os 4 jogadores
                //retornar o proximo evento

    });









    socket.on('player_find_match_backup', (data)=>{

        var player = GetPlayerFromID(data.playerID)
        console.log("\nO player: "+player.name+"("+player.ID+")"+" iniciou uma busca por partida.");

        if(player && !player.isReady){
            if(!playerMatchList.includes(player) ){
                
                playerMatchList.push(player);
                
                setTimeout(() => {
                    isMatch=false;
                    playerMatchList.forEach(p=>{
                        if(p!=player){
                            if(!p.isReady){
                                console.log("\nUma partida foi encontrada!");

                                isMatch=true;
                                p.isReady=true;

                                player.isReady=true;

                                let roomID = GeneratorID();
                                let sock = GetSocketBySocketID(player.socketID);
                                let sock2 = GetSocketBySocketID(p.socketID);

                                sock.join(roomID);

                                const rooms = io.of("/").adapter.rooms;
                                const room = rooms.get(roomID)

                            
                                room.ID=roomID;
                                room.name="MatchRoom";
                                room.playerMax=2;
                                room.playerList=[];
                                room.playerInfoList=[];
                                room.isRunning=false;

                                //room.playerList.push(player);

                                roomList.push(room);
                                
                                // console.log("socketID: "+player.socketID);
                                // console.log("SOCK: "+sock);
                                // console.log("roomID: "+roomID);
                                //console.log(GetSocketBySocketID(player.socketID));
                                //sock.join(roomID);
                                sock2.join(roomID);


                                var pList = {
                                    roomID:0,
                                    playerList:[]
                                }

                                pList.roomID=roomID;
                                pList.playerList.push(player);
                                pList.playerList.push(p);

                                room.playerList.push(player);
                                room.playerList.push(p);
                               

                                io.to(roomID).emit("start_match",pList);

                                console.log("\n"+player.name+"("+player.ID+")"+" VS. "+p.name+"("+p.ID+")");
                                console.log("\nQuem sairá vitorioso nessa?");
                                playerMatchList.splice(GetIndex(playerMatchList,p),1);
                                playerMatchList.splice(GetIndex(playerMatchList,player),1);
                                return false;
                            }else{
                                console.log("\nO player: "+player.name+"("+player.ID+")"+" tentou uma partida com o player: "+p.name+"("+p.ID+")");
                            }
                        }
                    })
                    if(!isMatch){
                        console.log("\nO player: "+player.name+"("+player.ID+")"+" não encontrou uma partida.");
                        playerMatchList.splice(GetIndex(playerMatchList,player),1);
                        socket.emit("match_not_found");
                    }
                }, 50)

                return false;
            
            }
        }


        
    });
















    //#endregion




	socket.on('disconnect', (reason) => {
        console.log("\n\ndisconnect ============================================================================================");
        console.log("Desconexão SocketID: "+socket.id);
        var player;
        var lastRoom;
        playerList.forEach(p => {
            if (p.socketID==socket.id) {
                player = p;
                return false
            }
        });

        if(player){
            
            roomList.forEach(room=>{
                if (room.playerList.includes(player)) {
                    lastRoom=room;
                    return false;
                }
            })        
                    
            console.log("O player: "+player.name+"("+player.ID+")"+" foi desconectado.");
            //console.log("Removendo o player da roomID: "+player.roomID+".");

            if(lastRoom){
                console.log("LastRoom: "+lastRoom.name+"("+lastRoom.ID+")");
                lastRoom.playerList.splice(GetIndex(lastRoom.playerList,player),1);
                io.to(lastRoom.ID).emit("player_disconnected",player);
            }

            playerList.splice(GetIndex(playerList,player),1)
            socketList.splice(GetIndex(socketList,socket),1)
        }

        RemoveInactiveRoom(socket);

        //socket.emit("server_info",Server_info());
        socket.broadcast.emit("server_info",Server_info());
        // Atualiza no client o numero de players na room
        PlayersInRoom(socket);
    });




});

// App Code starts here
console.log('Server is running!');