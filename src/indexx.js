const io = require('socket.io')(process.env.PORT || 3000, { //8124 is the local port we are binding the pingpong server to
 
});


socketIDList=[];
playerList=[];
usedID=[0]
player={
    ID:0,
    socketID:0
}

console.log("playerList amount: "+Object.keys(playerList).length);

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
                p.socketID=socket.id

                p.ID=GeneratorID()
                playerList.push(p);
                //io.to('room1').emit('join_remote_player',socket.id);
                //socket.broadcast.emit("join_remote_player",p);
                console.log("++ Joined Player: "+ JSON.stringify(p))

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
            }
        }

        for (let i = 0; i < Object.keys(playerList).length; i++) {
            const p = playerList[i];
            if (p.socketID==socket.id) {
                d.ID=p.ID;
            }
        }

        
        d.pos=data.pos;

        socket.broadcast.emit('player_pos',d);
        //io.to('room1').emit('player_pos',d);
        ///////////////////////////////console.log('player_pos: ' +JSON.stringify(d));	
    });

    socket.on('player_rot', async(data) => {
        

        const r={
            ID:0,
            rot:0.0
        }


        for (let i = 0; i < Object.keys(playerList).length; i++) {
            const p = playerList[i];
            if (p.socketID==socket.id) {
                r.ID=p.ID;
            }
        }


        r.ID=data.ID;
        r.rot=data.rot;

        socket.broadcast.emit('player_rot',r);
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