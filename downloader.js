const request = require('request');
const fileHelper = require('./utils/fileHelper.js')
const fs = require('fs');
const seasonNames = require('./utils/rebbl').seasonNames;
const REBBL = require('./utils/rebbl');
const Game = require('./models/game').Game;
const Database = require('./database/database').Database;
const database = new Database();
database.connect();


let seasonToStartAt = 0;
const seasonToEndAt = 14;

saveGamesToDatabase = async (games, competition) => {
    for (let i = 0; i < games.length; i++) {
        const game = Game.parse(games[i]);
        await database.insertGame(game, competition.id);
    }
}

downloadLeague = async (league, seasons) => {
    if (league.simple_name === 'BIGO' && seasonToStartAt < 3) {
        seasonToStartAt = 3;
    }
    for (let i = seasonToStartAt; i < seasons.length && i < seasonToEndAt; i++) {
        request.get(REBBL.api.host + '/division/' + league.name + '/' + seasons[i], async (error, response) => {
            try {
                const divisionNames = JSON.parse(response.body);
                console.log(league.simple_name + ', season: ' + seasons[i] + ', divisions: ' + divisionNames.length);
        
                for (let j = 0; j < divisionNames.length; j++) {                    
                    if (!divisionNames[j].includes('Swiss')) {
                        const competition = await database.insertCompetition({ name: divisionNames[j] }, seasons[i], league.id);

                        request.get(REBBL.api.host + '/division/' + league.name + '/' + seasons[i] + '/' + divisionNames[j], async (error2, response2) => {
                            if (!error2) {
                                const games = JSON.parse(response2.body);
                                await saveGamesToDatabase(games, competition);
                            }
                            else {
                                console.log('API error on ' + league.simple_name + ', ' + seasons[i] + ', ' + divisionNames[j] + ': ' + error2);
                            }
                        });
                    }
                    else {
                        console.log('Removed ' + divisionNames[j]);
                    }
                }
            } catch (e) {
                console.log('ERROR reading ' + seasons[i] + ' league ' + league.simple_name + ': ' + e);
            }
        });
    };
}

database.getLeagues().then(async (leagues) => {
    leagues.forEach(async (league) => {
        downloadLeague(league, seasonNames);
    });
});
