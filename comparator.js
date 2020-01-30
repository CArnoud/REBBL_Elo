const seasonNames = require('./utils/rebbl').seasonNames;
const Elo = require('./utils/elo').Elo;
const Season = require('./models/season').Season;
const Predictor = require('./utils/predictor').Predictor;
const config = require('./utils/config');
const fileHelper = require('./utils/fileHelper.js');
const Database = require('./database/database').Database;
const database = new Database();
database.connect();


const numberOfSeasonsToLoad = 1;
const numberOfSeasonsToSimulate = 11;


// get elo for all parameter sets
const parameterSets = [{
    norm: 1000,
    stretchingFactor: 2000,
    maxChange: 100,
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
}, {
    norm: 1000,
    stretchingFactor: 300,
    maxChange: 30,
    name: 'chess-adjusted'
}, {
    norm: 1000,
    stretchingFactor: 700,
    maxChange: 100,
    name: 'charlitos'
}, {
    norm: 1000,
    stretchingFactor: 10000,
    maxChange: 500,
    name: 'crazy'
}];


database.getSeasons().then(async (seasonsFromDb) => {
    const seasons = [];
    for (i in seasonsFromDb) {
        const games = await database.getGamesFromSeason(seasonsFromDb[i].id);
        seasons.push(new Season(seasonsFromDb[i], games));
    }

    let eloCalculators = [];
    for (m in parameterSets) {
        eloCalculators.push(new Elo(parameterSets[m].norm, parameterSets[m].stretchingFactor, parameterSets[m].maxChange, {}));
        for (let i = 0; i < seasonsFromDb.length && i < numberOfSeasonsToLoad; i++) {
            eloCalculators[m].updateFullSeason(seasons[i]);
        }
    }

    // save all elo checkpoints
    let predictors = [];
    for (let i in eloCalculators) {
        predictors.push(new Predictor(eloCalculators[i]));
    }

    // predict results using each of the elos (prediction algorithm doesnt change)
    const results = [];
    for (let i in predictors) {
        const predictorResults = [];

        for (let j = numberOfSeasonsToLoad; j < numberOfSeasonsToSimulate + numberOfSeasonsToLoad; j++) {
            predictorResults.push(predictors[i].predictSeason(seasons[j]));
        }

        results.push(predictorResults);
    }

    // compare results
    const sums = [];
    for (let i in results) {
        let sum = 0;
        for (let j in results[i]) {
            sum = sum + results[i][j];
        }

        sums.push(sum);
    }

    // console.log(predictors[0].eloCalculator.getElo());

    console.log(sums);
    database.end();
});
