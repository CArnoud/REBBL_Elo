const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Season = require('./models/season').Season;
const Predictor = require('./utils/predictor').Predictor;

const numberOfSeasonsToLoad = 1;
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
    eloCalculators.push(new Elo(parameterSets[m].norm, parameterSets[m].stretchingFactor, parameterSets[m].maxChange, {}));
    for (let i = 0; i < seasonNames.length && i < numberOfSeasonsToLoad; i++) {
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

// save all elo checkpoints
fileHelper.writeFile('files/elo/elo.json', JSON.stringify(elo));
let predictors = [];
for (let i in eloCalculators) {
    predictors.push(new Predictor(eloCalculators[i]));
}

// predict results using each of the elos (prediction algorithm doesnt change)
const seasonToPredict = new Season(seasonNames[numberOfSeasonsToLoad]);
const results = [];
for (let i in predictors) {
    results.push(predictors[i].predictSeason(seasonToPredict));
    // console.log('===========');
}

// compare results
console.log('number of teams: ' + seasonToPredict.getTeamIds().length);
console.log('total games: ' + seasonToPredict.getNumberOfGames());
console.log(results);
