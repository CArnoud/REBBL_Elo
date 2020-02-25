const request = require('request');
const seasonNames = require('./utils/rebbl').seasonNames;
const REBBL = require('./utils/rebbl');
const Game = require('./models/game').Game;
const Database = require('./database/database').Database;
const database = new Database();
database.connect();


const seasonIndex = 12; 

saveGamesToDatabase = async (games, competition) => {
    for (let i = 0; i < games.length; i++) {
        if (Game.isGameValid(games[i])) {
            const game = Game.parse(games[i]);
            await database.insertGame(game, competition.id);
        }
    }
}

downloadLeague = async (league, seasonName) => {
    request.get(REBBL.api.host + '/division/' + league.name + '/' + seasonName, async (error, response) => {
        try {
            const divisionNames = JSON.parse(response.body);
            console.log(league.simple_name + ', season: ' + seasonName + ', divisions: ' + divisionNames.length);

            for (let j = 0; j < divisionNames.length; j++) {
                if (!divisionNames[j].includes('Swiss')) {
                    const competition = await database.insertCompetition({ name: divisionNames[j] }, seasonName, league.id);
                    const divisionUrl = REBBL.api.host + '/division/' + league.name + '/' + seasonName + '/' + encodeURI(divisionNames[j]);

                    request.get(divisionUrl, async (error2, response2) => {
                        try {
                            if (!error2) {
                                const games = JSON.parse(response2.body);
                                await saveGamesToDatabase(games, competition);
                            }
                            else {
                                console.log('API error on ' + league.simple_name + ', ' + seasonName + ', ' + divisionNames[j] + ': ' + error2);
                            }
                        } catch (e) {
                            console.log('Error on GET ' + divisionUrl);
                            console.log(e);
                            console.log(response2.body);
                        }
                    });
                }
                else {
                    console.log('Removed ' + divisionNames[j]);
                }
            }
        } catch(e) {
            console.log('ERROR reading ' + seasonName + ' league ' + league.simple_name + ': ' + e);
        }
    });
}

database.getLeagues().then(async (leagues) => {
    leagues.forEach(async (league) => {
        await downloadLeague(league, seasonNames[seasonIndex]);
    });
});
