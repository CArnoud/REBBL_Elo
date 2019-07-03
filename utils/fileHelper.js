const fs = require('fs');

exports.readFile = (fileName) => {
    return fs.readFileSync(fileName);
};

exports.readDir = (path) => {
    return fs.readdirSync(path);
};

exports.writeFile = (fileName, string) => {
    fs.writeFile(fileName, string, function(e) {
        if (e) {
            console.log(e);
        }
    });
};
