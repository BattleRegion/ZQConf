const CONF_PATH = process.argv[2];
const fs = require('fs');
const path = require('path');


//遍历文件夹
let allConfFiles = [];
travel(CONF_PATH);

function travel(folderPath){
    fs.readdirSync(folderPath).forEach(function (file) {
        let pathname = path.join(folderPath, file);
        if (fs.statSync(pathname).isDirectory()) {
            travel(pathname);
        } else {
            console.log(fs.statSync(pathname));
            allConfFiles.push(pathname);
        }
    });
}

var isUnixHiddenPath = function (path) {
    return (/(^|\/)\.[^\/\.]/g).test(path);
};

console.log(allConfFiles);