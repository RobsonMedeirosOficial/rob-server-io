const io = require('socket.io')(process.env.PORT || 3000, { //8124 is the local port we are binding the pingpong server to
 
});


// Inicializa variáveis ==========================================================
playerList=[];
usedID=[0]
player={
    ID:0,
    socketID:0,
    health:100,
    healthMax:100,
    points:0
}

playerProperty={
socketID:"",
ID:0000,
lv:1,
exp:0,
victories:0,
defeats:0,
heath:100
}

weapons={
    ID:1,
    name:"none",
    damage:30,
    ammo:30,
}

//console.log("playerList amount: "+Object.keys(playerList).length);
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

    socket.on('player_joined', (data) => {

        // toda vez que houver um socket novo, verificar para cadastrar e emitir um broadcast
        if (Object.keys(playerList).length>0) {
            
            console.log("================================== IS INLIST ==============================================");
            
    
            let isInList = false


            for( var i = 0; i < Object.keys(playerList).length; i++){ 
                if ( playerList[i].socketID === socket.id) { 
                    isInList=true;
                    break;
                }
            }




            if (isInList==false) {
                //socketIDList.push(socket.id);
                p = {...player};
                p.socketID=socket.id;
                p.health=100;

                p.ID=GeneratorID();
                playerList.push(p);
                //io.to('room1').emit('join_remote_player',socket.id);
                //socket.broadcast.emit("join_remote_player",p);
                console.log("++ Joined Player: "+ JSON.stringify(p));

                socket.broadcast.emit("join_remote_player",p);
                for( var i = 0; i < Object.keys(playerList).length; i++){ 
                    socket.emit("join_remote_player",playerList[i]);
                }
            }
            console.log("--------------------------------------------------------------------------------------------");
            console.log("playerList amount: "+Object.keys(playerList).length+"   |   "+JSON.stringify(playerList));
            console.log("============================================================================================");
        }
        else
        {
            p = {...player};
            p.socketID=socket.id
            p.health=100;

            p.ID=GeneratorID()
            playerList.push(p);
            //io.to('room1').emit('join_remote_player',socket.id);
            socket.emit("join_remote_player",p);
            //socket.broadcast.emit("join_remote_player",p);
            console.log("++ Joined Player: "+ JSON.stringify(p))
        }
        console.log("================================== PLAYER LIST ==============================================");
        console.log("playerList amount: "+Object.keys(playerList).length+"   |   "+JSON.stringify(playerList));
        console.log("============================================================================================");

    });

    socket.on('player_pos', async (data) => {
        

        const d={
            ID:0,
            pos:{
                x:0.0,
                y:0.0,
                z:0.0
            }//,
            // v:0,
            // h:0
        }

        for (let i = 0; i < Object.keys(playerList).length; i++) {
            const p = playerList[i];
            if (p.socketID==socket.id) {
                d.ID=p.ID;
            }
        }

        
        d.pos=data.pos;
        // d.v=data.v;
        // d.h=data.h;
        socket.broadcast.emit('player_pos',d);
        //io.to('room1').emit('player_pos',d);
        ///////////////////////////////////////////////////////////console.log('player_pos: ' +JSON.stringify(d));	
    });

    socket.on('player_shoot', async (data) => {
        

        const d={
            ID:0,
            point:{
                x:0.0,
                y:0.0,
                z:0.0
            }//,
            // v:0,
            // h:0
        }

        for (let i = 0; i < Object.keys(playerList).length; i++) {
            const p = playerList[i];
            if (p.socketID==socket.id) {
                d.ID=p.ID;
            }
        }

        
        d.point=data.point;
        // d.v=data.v;
        // d.h=data.h;
        socket.broadcast.emit('player_shoot',d);
        console.log('Player shooting: '+JSON.stringify(d));
        //io.to('room1').emit('player_pos',d);
        ///////////////////////////////////////////////////////////console.log('player_pos: ' +JSON.stringify(d));	
    });

    socket.on('player_hit', async (data) => {
        
        // recebe ID de quem foi atingido e cadastra o id de quem atingiu 
        const d={
            hit_ID:0,
            shoot_ID:0,
            health:100
            
        }

        for (let i = 0; i < Object.keys(playerList).length; i++) {
            const p = playerList[i];
            if (p.socketID==socket.id) {
                d.hit_ID=data.hit_ID;
                d.shoot_ID=p.ID;
                
                for (let j = 0; j < Object.keys(playerList).length; j++){
                    const pp = playerList[j];
                    if (pp.ID==d.hit_ID) {

                        pp.health-=30;
                        if (pp.health<=0) {
                            pp.health=0;
                        }
                        d.health=pp.health
                        console.log('Player hitting =================: '+JSON.stringify(pp));

                    }
                }
                
            }
        }

        
        d.point=data.point;
        // d.v=data.v;
        // d.h=data.h;
        socket.broadcast.emit('player_hit',d);
        socket.emit('player_hit',d);
        console.log('Player hitting: '+JSON.stringify(d));

        if (d.health==0) {
            socket.emit('player_respawn',d);
            socket.broadcast.emit('player_respawn',d);
        }
        //io.to('room1').emit('player_pos',d);
        ///////////////////////////////////////////////////////////console.log('player_pos: ' +JSON.stringify(d));	
    });

    socket.on('player_respawn', async (data) => {
        
        // recebe ID de quem foi atingido e cadastra o id de quem atingiu 
        const d={
            ID:0,
            health:0,
            healthMax:0
        }

        for (let i = 0; i < Object.keys(playerList).length; i++) {
            const p = playerList[i];
            if (p.socketID == socket.id) {
                if (playerList[i].health <= 0) {
                    playerList[i].health = playerList[i].healthMax;
                    d.ID = playerList[i].ID;
                    d.health = playerList[i].health;
                    d.healthMax = playerList[i].health;
                    
                    setTimeout(() => {
                        socket.emit('player_revive',d);
                        socket.broadcast.emit('player_revive',d);
                        console.log('***** player_revive: ' +JSON.stringify(d))
                    }, 3000);
                    
                }
            }
        }
        ///////////////////////////////////////////////////////////console.log('player_pos: ' +JSON.stringify(d));	
    });
    
    socket.on('player_rot', async(data) => {
        

        const r={
            ID:0,
            rot:0.0,
            pitch:0.0

        }


        for (let i = 0; i < Object.keys(playerList).length; i++) {
            const p = playerList[i];
            if (p.socketID==socket.id) {
                r.ID=p.ID;
               
            }
        }


        r.ID=data.ID;
        r.rot=data.rot;
        r.pitch=data.pitch;
        socket.broadcast.emit('player_rot',r);
        //io.to('room1').emit('player_rot',r);
        ///////////////////////////////////////////console.log('player_rot: ' +JSON.stringify(r));	
    });

    socket.on('player_anims', async(data) => {
        

        const a={
            ID:0,
            v:0,
            h:0

        }


        for (let i = 0; i < Object.keys(playerList).length; i++) {
            const p = playerList[i];
            if (p.socketID==socket.id) {
                a.ID=p.ID;
               
            }
        }


        a.ID=data.ID;
        a.v=data.v;
        a.h=data.h;
        socket.broadcast.emit('player_anims',a);
        console.log('player_anims: ' +JSON.stringify(a));
        //io.to('room1').emit('player_rot',r);
        ///////////////////////////////////////////console.log('player_rot: ' +JSON.stringify(r));	
    });
// Ao detectar disconexão remover o socket da lista playerList
	socket.on('disconnect', (reason) => {
        console.log("============================================================================================");
        console.log("SocketID: "+socket.id);
        for( var i = 0; i < Object.keys(playerList).length; i++){ 
            socket.broadcast.emit("remove_remote_player",socket.id);


            if ( playerList[i].socketID === socket.id) { 
    
                if (usedID.includes(playerList[i].ID)) {
                    usedID.splice(playerList[i].ID,1);
                }
                playerList.splice(i, 1); 
            }
        
        }

        socket.broadcast.emit("remove_remote_player",socket.id);
        console.log("playerList amount: "+Object.keys(playerList).length+"   |    "+JSON.stringify(playerList));

        console.log("===============================================================================================");
	});

});

// App Code starts here
console.log('Server is running!');