const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;

const numberOfSeasons = 1;
let elo = {};

function readDivision(seasonName, fileName) {
    return JSON.parse(fileHelper.readFile('files/' + seasonName + '/' + fileName));
}

function readSeason(seasonName) {
    const fileNames = fileHelper.readDir('files/' + seasonName);
    const results = [];
    for (let i = 0; i < fileNames.length; i++) {
        results.push(readDivision(seasonName, fileNames[i]));
    }

    return results;
}

const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange);
for (let i = 0; i < seasonNames.length && i < numberOfSeasons; i++) {
    const results = readSeason(seasonNames[i]);

    for (let j=0; j < results.length; j++) {
        for (let k=0; k < results[j].length; k++) {
            for (let l = 0; l < results[j][k].length; l++) {
                eloCalculator.update(results[j][k][l]);
            }
        }
    }    
}

elo = eloCalculator.getElo();
console.log(elo);
console.log(Object.keys(elo).length);

let eloList = [];
let sum = 0;
for (let i in elo) {
    eloList.push(elo[i]);
    sum = sum + elo[i];
}

// console.log('sum ' + sum);
// console.log('avg ' + (sum / eloList.length));

fileHelper.writeFile('files/elo/elo.json', JSON.stringify(elo));
