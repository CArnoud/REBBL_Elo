const fileHelper = require('./utils/fileHelper.js');
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Season = require('./models/season').Season;
const Database = require('./database/database').Database;
const database = new Database();
database.connect();


const weekToStopAt = null;
const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, {});

database.getSeasons().then(async (seasonsFromDb) => {
    const seasons = [];

    for (let i = 0; i < seasonsFromDb.length; i++) {
        const games = await database.getGamesFromSeason(seasonsFromDb[i].id);
        seasons.push(new Season(seasonsFromDb[i], games));
    }
    seasons.sort(Season.sortSeasons);

    for (let i = 0; i < seasons.length; i++) {
        if (i === seasons.length - 1 && weekToStopAt) {
            await eloCalculator.updateFullSeason(seasons[i], database, weekToStopAt);
        }
        else {
            await eloCalculator.updateFullSeason(seasons[i], database);
        }
    }
}).then(() => {
    database.end();
});
