
var room={
    ID:0,
    name:'',
    playerMax:10,
    playerList:[1257,7096]
}

var player={
    ID:7096
}

function GetIndex(value, array){
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


var id=GetIndex(player.ID,room.playerList);
                        
room.playerList.splice(id,1); 
console.log(id);
console.log(room);

