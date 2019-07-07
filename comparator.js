const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Season = require('./models/season').Season;

const numberOfSeasons = 1;
let elo = {};

// get elo for all parameter sets
const parameterSets = [{
    norm: config.ELO.norm,
    stretchingFactor: config.ELO.stretchingFactor,
    maxChange: config.ELO.maxChange,
    name: 'config'
}, {
    norm: 1000,
    stretchingFactor: 2 * Math.sqrt(46),
    maxChange: 100,
    name: 'fancy stretching'
}];

let eloCalculators = [];
for (m in parameterSets) {
    eloCalculators.push(new Elo(parameterSets[m].norm, parameterSets[m].stretchingFactor, parameterSets[m].maxChange));
    for (let i = 0; i < seasonNames.length && i < numberOfSeasons; i++) {
        //const results = readSeason(seasonNames[i]);

        const season = new Season(seasonNames[i]);
        const results = season.getGames();
    
        for (let j=0; j < results.length; j++) {
            for (let k=0; k < results[j].length; k++) {
                for (let l = 0; l < results[j][k].length; l++) {
                    eloCalculators[m].update(results[j][k][l]);
                }
            }
        }
    }
}

elo = eloCalculators[0].getElo();
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

// save all elo checkpoints
fileHelper.writeFile('files/elo/elo.json', JSON.stringify(elo));

// predict results using each of the elos (prediction algorithm doesnt change)

// compare results
