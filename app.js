const CONF_PATH = process.argv[2];
const fs = require('fs');
const path = require('path');
const Async = require('async');
const archiver = require('archiver');
//遍历文件夹
let allConfFiles = [];
let parseTasks = [];
let timeV = ~~(new Date().getTime()/1000);
travel(CONF_PATH);
for(let i = 0; i<allConfFiles.length;i++){
    let fPath = allConfFiles[i];
    let name = path.basename(fPath,'.xlsx');
    if(fs.existsSync(`./resolver/${name.toLowerCase()}.js`)){
        let resolver = require(`./resolver/${name.toLowerCase()}`);
        let r = new resolver({
            name:name,
            path:fPath
        });
        let f = function(cb){
            r.parse(timeV,cb);
        };
        parseTasks.push(f);
    }
}

//zip server
parseTasks.push(function(cb){
    let zipFolderPath = `${process.cwd()}/conf/${timeV}`;
    let zipPath = `${process.cwd()}/conf/latest.zip`;
    if(fs.existsSync(zipPath)){
        fs.unlinkSync(zipPath);
    }

    let output = fs.createWriteStream(zipPath);
    let archive = archiver('zip');

    fs.readdirSync(zipFolderPath).forEach(function (file) {
        let p = `${zipFolderPath}/${file}`;
        archive.append(fs.createReadStream(p), { name: file });
    });

    archive.on('entry', function(r) {
        // console.log(r);
        // cb(null, null);
    });

    archive.on('progress', function(r) {
        console.log(r);
        if(r['entries'].total === r['entries'].processed){
            setTimeout(()=>{
                cb(null, null);
            },1000);
        }
    });

    archive.pipe(output);
    archive.finalize();
});

//zip client
parseTasks.push(function(cb){
    let clientFolderPath = `${process.cwd()}/conf/${timeV}_client`;
    let lastPath = `${process.cwd()}/conf/last_client`;
    if(fs.existsSync(lastPath)){
        let files = fs.readdirSync(lastPath);
        files.forEach((file) => {
            let curPath = lastPath + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(lastPath);
    }
    fs.renameSync(clientFolderPath, lastPath);
    cb(null,{})
});

Async.series(parseTasks, (e,r)=>{
    let code = 0;
    if(e){
        code = 1;
    }
    console.log("parse done!!!!");
    process.exit(code);
});

function delDir(path){
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}

function travel(folderPath){
    fs.readdirSync(folderPath).forEach(function (file) {
        let pathname = path.join(folderPath, file);
        if (fs.statSync(pathname).isDirectory()) {
            travel(pathname);
        } else {
            if(!isUnixHiddenPath(pathname)){
                allConfFiles.push(pathname);
            }
        }
    });
}

function isUnixHiddenPath(path) {
    return (/(^|\/)\.[^\/\.]/g).test(path);
}
