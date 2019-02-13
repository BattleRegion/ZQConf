const XLSX = require('xlsx');
const fs = require('fs');
class Base {
    constructor(props) {
        this.name = props.name;
        this.path = props.path;
        this.confData = {};
    }

    parse(timeV, cb){
        console.log(`begin parse ${this.name} path ${this.path}`);
        let workbook = XLSX.readFile(this.path);
        let sheet_name_list = workbook.SheetNames;
        for(let i = 0;i<sheet_name_list.length;i++){
            let name = sheet_name_list[i];
            this.confData[name] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[i]]);
        }
        console.log(`parse ${this.name} end`);
        this.specDeal();
        this.writeContentToJson(timeV, e=>{
            cb(e, this.confData);
        });
    }

    specDeal(){

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
        fs.writeFile(jsonPath, JSON.stringify(this.confData,null,4), function (err) {
            cb(err);
        })
    }
}

module.exports = Base;