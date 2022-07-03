

    
function SortPlayer(valueKey,obj) {
        if (valueKey && obj) {
            console.log('************************************************');
            console.log('Tipo de sort: '+valueKey);
            //console.log('Quantidade: : '+Object.keys(obj).length);
            console.log("Sorteando...");
            let o={...obj};
            let objList = Object.keys(o);
            let valueKeyList = [];
            const sortedList={}
            for (let i = 0; i < Object.keys(o).length; i++) {
                
                valueKeyList.push(o[objList[i]][valueKey])
            }
            
            if (valueKeyList) {
                valueKeyList.sort((a,b)=>b-a);
                console.log('=======================================');
                //console.log('Sortiado: '+sortedList);
                
                for (let k = 0; k < valueKeyList.length; k++) {
                    let a = valueKeyList[k];
                    
                    for (let j = 0; j < Object.keys(o).length; j++) {
                        let b = o[objList[j]];
                        
                        if (a==b[valueKey]) {
                            console.log('>>>>> '+a);
                            
                            sortedList[objList[j]]=b;
                        }
                    }
                }
                
        }
        console.log('=======================================');
        //console.log(sortedList);
        return sortedList;
    }
}

function GetObjectFromIndex(index, objectList){
    let obj=undefined;
    if (true) {
        if (index>=0 && index<=Object.keys(objectList).length) {
            if (Object.keys(objectList)[index]) {
                // obj=Object.keys(objectList)[index]
                obj=objectList[Object.keys(objectList)[index]]
            }else{console.log('3) Erro Verificar index: '+index)}
        }else{console.log('2) Erro Verificar index: '+index+"   e  objectList: "+objectList);}
    }else{console.log('1) Erro Verificar index: '+index+"   e  objectList: "+objectList);}
    // console.log(objList[Object.keys(objList)[0]]);
    // return objList[Object.keys(objList)[0]]
    return obj;
}

function GetID(usedID){
    let list=[];



    return list;
}

module.exports = GetObjectFromIndex;
module.exports = SortPlayer;
module.exports = GetID;