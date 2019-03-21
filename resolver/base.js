const XLSX = require('xlsx');
const fs = require('fs');
const ignoreIndex = 2;
const Async = require('async');

class Base {
    constructor(props) {
        this.name = props.name;
        this.path = props.path;
        this.serverConfData = {};
        this.clientConfData = {};
    }

    parse(timeV, cb) {
        console.log(`begin parse ${this.name} path ${this.path}`);
        let workbook = XLSX.readFile(this.path);
        let sheet_name_list = workbook.SheetNames;
        let opts = {};
        //修改为只解析第一个sheet的
        let firstSheetName = sheet_name_list[0];
        if (firstSheetName) {

            this.serverConfData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], opts);
            //去除第一行中文描述
            this.serverConfData = this.serverConfData.slice(1, this.serverConfData.length);

            this.specDeal();

            let serverFolder = `${process.cwd()}/conf/${timeV}`;
            let clientFolder = `${serverFolder}_client`;

            let serverTask = (cb) => {
                this.writeContentToJson(serverFolder, this.serverConfData, cb)
            };

            let tasks = [serverTask];

            //都是0就不解析到客户端了
            let clientConfTag = this.serverConfData[0];
            let total = 0;
            let keys = Object.keys(clientConfTag);
            for(let i = 0;i<keys.length;i++) {
                total = total + ~~clientConfTag[keys[i]]
            }
            console.log(`${this.name} : ${total}`);
            if(total > 0){
                let clientTask = (cb) => {
                    this.writeContentToJson(clientFolder, this.clientConfData, cb)
                };
                tasks.push(clientTask)
            }
            Async.waterfall(tasks, (e,r)=>{
                cb(e,r);
            })
        }
        else {
            cb(null, {});
        }
    }

    specDeal() {
        let clientConfTag = this.serverConfData[0];
        let keys = Object.keys(clientConfTag);
        let total = 0;
        this.serverConfData = this.serverConfData.slice(1, this.serverConfData.length);
        this.clientConfData = this.serverConfData.map(data=>{
            for(let i = 0;i<keys.length;i++){
                let k = keys[i];
                total = total + clientConfTag[k];
                if(clientConfTag[k] !== 1){
                    delete data[keys[i]];
                }
            }
            return data;
        });
    }

    writeContentToJson(folder, content, cb) {
        let jsonName = `${this.name.toLowerCase()}.json`;
        let jsonPath = `${folder}/${jsonName}`;
        let dirExist = fs.existsSync(folder);
        if (!dirExist) {
            fs.mkdirSync(folder);
        }
        fs.writeFile(jsonPath, JSON.stringify(content, null, 4), function (err) {
            cb(err);
        })
    }
}

module.exports = Base;