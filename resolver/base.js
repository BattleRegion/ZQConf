const XLSX = require('xlsx');
const fs = require('fs');
const ignoreIndex = 2;
class Base {
    constructor(props) {
        this.name = props.name;
        this.path = props.path;
        this.confData = {};
        this.serverConfData = {};
        this.clientConfData = {};
    }

    parse(timeV, cb){
        console.log(`begin parse ${this.name} path ${this.path}`);
        let workbook = XLSX.readFile(this.path);
        let sheet_name_list = workbook.SheetNames;
        let opts = {}
        for(let i = 0;i<sheet_name_list.length;i++){
            let name = sheet_name_list[i];
            this.confData[name] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[i]],opts);
        }
        //去掉头N行
        this.serverConfData.Card = this.confData.Card.slice(ignoreIndex,this.confData.Card.length)

        this.specDeal();
        this.writeContentToJson(timeV, e=>{
            cb(e, this.serverConfData);
        });
        // this.writeClientContentToJson(timeV, e=>{
        //     cb(e, this.clientConfData);
        // });
    }

    specDeal(){
        let tag = this.confData.Card.slice(1,2)[0];
        let list =[]
        for (let i = 0; i < this.serverConfData.Card.length; i++) {
            let card = this.serverConfData.Card[i]
            let newCard = {}
            Object.keys(tag).forEach(function(key){
                if(tag[key] === 1){
                    if(card[key] != null){
                        newCard[key] = card[key]
                    }
                }
            })
            list.push(newCard)
        }
        this.clientConfData.Card = list;
    }

    writeContentToJson(timeV, cb){
        let jsonName = `${this.name.toLowerCase()}.json`;
        let versionConfPath = `${process.cwd()}/conf/${timeV}`;
        let jsonPath = `${versionConfPath}/${jsonName}`;
        console.log(`write to path ${jsonPath}`);
        let dirExist = fs.existsSync(versionConfPath);
        if(!dirExist){
            fs.mkdirSync(versionConfPath);
        }
        fs.writeFile(jsonPath, JSON.stringify(this.serverConfData,null,4))

        let clientjsonName = `${this.name.toLowerCase()}.json`;
        let clientversionConfPath = `${process.cwd()}/conf/${timeV}`;
        let clientjsonPath = `${clientversionConfPath}/${clientjsonName}`;
        console.log(`write to path ${clientjsonPath}`);
        let clientdirExist = fs.existsSync(clientversionConfPath);
        if(!clientdirExist){
            fs.mkdirSync(clientversionConfPath);
        }
        fs.writeFile(clientjsonPath, JSON.stringify(this.serverConfData,null,4), function (err) {
            cb(err);
        })
    }

    // writeClientContentToJson(timeV, cb){
    //     let jsonName = `${this.name.toLowerCase()}.json`;
    //     let versionConfPath = `${process.cwd()}/conf/${timeV}_client`;
    //     let jsonPath = `${versionConfPath}/${jsonName}`;
    //     console.log(`write to path ${jsonPath}`);
    //     let dirExist = fs.existsSync(versionConfPath);
    //     if(!dirExist){
    //         fs.mkdirSync(versionConfPath);
    //     }
    //     fs.writeFile(jsonPath, JSON.stringify(this.clientConfData,null,4))
    //
    // }
}

module.exports = Base;