
import { SortPlayer,GetObjectFromIndex } from "./func.js";


// TESTING -----------------------------------------------------------------------------------------------------------------------
const playerList={};

let player={
    ID:0,
    socketID:'',
    name:"",
    points:0
}

let sortedName=['Chaves','Kiko','Chiquinha','Seu_Madruga','Seu_Barriga','Professor_Girafales','Dona_Florinda','Dona_Clotilde','Inhonho','Pops']
let sortedNameUsed=[]
let a=0

for (let i = 0; i < 50; i++) {
    let newPlayer = {...player}
    newPlayer.ID=i//Math.floor(Math.random() * 9999);
    let rndName=Math.floor(Math.random() * 9);
    newPlayer.name=sortedName[rndName];
    newPlayer.points=Math.floor(Math.random() * 9999);
    if (!sortedNameUsed.includes(newPlayer.name)) {
        newPlayer.ID=a
        sortedNameUsed.push(newPlayer.name)
        playerList['ID'+newPlayer.ID]=newPlayer;
       a++;
    }
    if (sortedNameUsed.length==sortedName.length) {
        
        break;
    }
}

//Exemplo ------------------------------------
let aa=SortPlayer('points',playerList)
const obj = GetObjectFromIndex(7,aa).name;
console.log(obj);


