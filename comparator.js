const Elo = require('./utils/elo').Elo;
const Season = require('./models/season').Season;
const Predictor = require('./utils/predictor').Predictor;
const Database = require('./database/database').Database;
const database = new Database();
database.connect();


// get elo for all parameter sets
const parameterSets = [{
    norm: 1000,
    stretchingFactor: 2000,
    maxChange: 100,
    name: 'config'
}, /*{
    norm: 1000,
    stretchingFactor: 2 * Math.sqrt(46),
    maxChange: 100,
    name: 'fancy stretching'
},*/ {
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
}];


database.getSeasons().then(async (seasonsFromDb) => {
    const seasons = [];
    const eloCalculators = [];
    const predictors = [];
    const results = [];
    let totalGames = 0;
    let gamesPredicted = 0;

    for (i in seasonsFromDb) {
        const games = await database.getGamesFromSeason(seasonsFromDb[i].id);
        const newSeason = new Season(seasonsFromDb[i], games);
        seasons.push(newSeason);
        totalGames = totalGames + newSeason.getGames().length;
    }
    seasons.sort(Season.sortSeasons);

    console.log(seasons.length + ' seasons found');
    
    for (m in parameterSets) {
        eloCalculators.push(new Elo(parameterSets[m].norm, parameterSets[m].stretchingFactor, parameterSets[m].maxChange, {}));
        // await eloCalculators[m].updateFullSeason(seasons[0], database);
    //     for (let i = 0; i < seasonsFromDb.length && i < numberOfSeasonsToLoad; i++) {
    //         eloCalculators[m].updateFullSeason(seasons[i]);
    //     }
    }

    // save all elo checkpoints
    for (let i in eloCalculators) {
        predictors.push(new Predictor(eloCalculators[i]));
    }

    // predict results using each of the elos (prediction algorithm doesnt change)
    for (let i in predictors) {
        const predictorResults = [];

        for (let j = 0; j < seasons.length; j++) {
            const predictResults = await predictors[i].predictSeason(seasons[j], database);
            predictorResults.push(predictResults);

            if (i === '0') {
                gamesPredicted = gamesPredicted + seasons[j].getGames().length;
            }
        }

        console.log('Charles ');
        console.log(predictorResults);
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

    console.log(sums);
    console.log(totalGames + ' games in total.');
    console.log(gamesPredicted + ' games predicted.');
    database.end();
});
