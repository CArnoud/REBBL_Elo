const request = require('request');
const fileHelper = require('./utils/fileHelper.js')
const fs = require('fs');
const seasonNames = require('./utils/rebbl').seasonNames;
const REBBL = require('./utils/rebbl');
const Game = require('./models/game').Game;
const Database = require('./database/database').Database;
const database = new Database();
database.connect();


const seasonToStartAt = 11;

const FILES_FOLDER = 'files/'

function parseSeason(season) {
    const seasonResult = [];
    const roundSet = new Set([]);

    for (let i=0; i < season.length; i++) {
        const game = Game.parse(season[i]);
        if (game.round && !roundSet.has(game.round)) {
            roundSet.add(game.round);
            seasonResult.push([]);
        }
    }
   
    for (let i=0; i < season.length; i++) {
        try {
            const game = Game.parse(season[i]);
            if (game.round) {
                seasonResult[game.round-1].push(game);
            }            
        }
        catch (e) {
            console.log('Unable to process round ' + i + 
                        ' season.length ' + season.length + 
                        ' rounds ' + roundSet.length + 
                        ': ' + JSON.stringify(season[i]));
        }
    }

    return seasonResult;
}

saveGamesToDatabase = async (games, competition) => {
    for (let i = 0; i < games.length; i++) {
        const game = Game.parse(games[i]);
        await database.insertGame(game, competition.id);
    }
}

downloadLeague = async (league, seasons) => {
    for (let i = seasonToStartAt; i < seasons.length; i++) {
        request.get(REBBL.api.host + '/division/' + league.name + '/' + seasons[i], (error, response) => {
            const divisionNames = JSON.parse(response.body);
            console.log(league.simple_name + ', season: ' + seasons[i] + ', divisions: ' + divisionNames.length);
    
            fs.mkdir(FILES_FOLDER + seasons[i], { recursive: true }, async (err) => {
                for (let j = 0; j < divisionNames.length; j++) {                    
                    if (!divisionNames[j].includes('Swiss')) {
                        const competition = await database.insertCompetition({ name: divisionNames[j] }, seasons[i], league.id);

                        request.get(REBBL.api.host + '/division/' + league.name + '/' + seasons[i] + '/' + divisionNames[j], async (error2, response2) => {
                            if (!error2) {
                                const games = JSON.parse(response2.body);
                                const season = parseSeason(games);            
                    
                                const fileName = FILES_FOLDER + '/' + seasons[i] + '/' + league.simple_name + '.' + divisionNames[j] + '.json';    
                                fileHelper.writeFile(fileName, JSON.stringify(season));

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
            });
        });
    };
}

database.getLeagues().then(async (leagues) => {
    leagues.forEach(async (league) => {
        downloadLeague(league, seasonNames);
    });
});


// downloadLeague(REBBL.leagueNames.REL, 'REL', seasonNames);
// downloadLeague(REBBL.leagueNames.GMAN, 'GMAN', seasonNames);
// downloadLeague(REBBL.leagueNames.BIGO, 'BIGO', seasonNames.slice(3));
