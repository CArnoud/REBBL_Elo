const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Season = require('./models/season').Season;
const Predictor = require('./utils/predictor').Predictor;

const numberOfSeasonsToLoad = 1;
const numberOfSeasonsToSimulate = 4;
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
}, {
    norm: 1500,
    stretchingFactor: 400,
    maxChange: 40,
    name: 'chess'
}];

let eloCalculators = [];
for (m in parameterSets) {
    eloCalculators.push(new Elo(parameterSets[m].norm, parameterSets[m].stretchingFactor, parameterSets[m].maxChange, {}));
    for (let i = 0; i < seasonNames.length && i < numberOfSeasonsToLoad; i++) {
        const season = new Season(seasonNames[i]);
        eloCalculators[m].updateFullSeason(season);
    }
}

// save all elo checkpoints
fileHelper.writeFile('files/elo/elo.json', JSON.stringify(elo));
let predictors = [];
for (let i in eloCalculators) {
    predictors.push(new Predictor(eloCalculators[i]));
}

// predict results using each of the elos (prediction algorithm doesnt change)
const numberOfGames = [];
const numberOfTeams = [];
const results = [];
for (let i in predictors) {
    const predictorResults = [];

    for (let j=numberOfSeasonsToLoad; j < numberOfSeasonsToSimulate + numberOfSeasonsToLoad; j++) {
        const seasonToPredict = new Season(seasonNames[j]);
        if (numberOfGames.length === j - numberOfSeasonsToLoad) {
            numberOfGames.push(seasonToPredict.getNumberOfGames());
        }
        if (numberOfTeams.length === j - numberOfSeasonsToLoad) {
            numberOfTeams.push(seasonToPredict.getTeamIds().length);
        }        
        predictorResults.push(predictors[i].predictSeason(seasonToPredict));
    }

    results.push(predictorResults);
}

// compare results
console.log(numberOfTeams);
console.log(numberOfGames);
console.log(results);
