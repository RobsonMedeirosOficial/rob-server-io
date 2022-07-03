var playerList=[];

var player={
    ID:0,
    socketID:'',
    room:{},
    lobby:{},
    isDone:false,
    name:'',
    points:0,
    victories:0,
    defeats:0,
    lv:1,
    exp:0,
    heath:100,
    heathMax:100,
    inventory:[],
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

var weapon={
    ID:0,
    name:'',
    damage:30,
    ammo:30,
    ammoMax:30,
    fireRate:1,

}

var gameMode={
    solo:{
        timerMax:90,
        penaltyTime:5,
        pointMax:15,
        playerMax:10,

    }
}

var room={
    ID:0,
    name:'',
    playerMax:10,
    pList:[]
}

var lobby={
    ID:0,
    name:'',
    pList:[]
}

module.exports = lobby;
module.exports = room;
module.exports = gameMode;
module.exports = weapon;
module.exports = weaponList;
module.exports = player;
module.exports = playerList;