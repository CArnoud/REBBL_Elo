const request = require('request');
const fileHelper = require('./utils/fileHelper.js')
const fs = require('fs');
const seasonNames = require('./utils/rebbl').seasonNames;
const REBBL = require('./utils/rebbl');
const Game = require('./models/game').Game;


const FILES_FOLDER = 'files/'
const seasonName = seasonNames[12];


function parseSeason(season) {
    const seasonResult = [];
    const roundSet = new Set([]);

    for (let i=0; i < season.length; i++) {
        const game = Game.parse(season[i]);
        if (game && game.round && !roundSet.has(game.round)) {
            roundSet.add(game.round);
            seasonResult.push([]);
        }
    }
   
    for (let i=0; i < season.length; i++) {
        try {
            const game = Game.parse(season[i]);
            if (game && game.round) {
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

function downloadSeason(leagueNameOnAPI, simpleLeagueName, season) {
    request.get(REBBL.api.host + '/division/' + leagueNameOnAPI + '/' + season, (error, response) => {
        const divisionNames = JSON.parse(response.body);
        console.log(simpleLeagueName + ', season: ' + season + ', divisions: ' + divisionNames.length);

        fs.mkdir(FILES_FOLDER + season, { recursive: true }, (err) => {
            for (let j = 0; j < divisionNames.length; j++) { 
                if (!divisionNames[j].includes('Swiss')) {
                    request.get(REBBL.api.host + '/division/' + leagueNameOnAPI + '/' + season + '/' + divisionNames[j], (error2, response2) => {
                        if (!error2) {
                            const games = JSON.parse(response2.body);
                            const currentSeason = parseSeason(games);            
                
                            const fileName = FILES_FOLDER + '/' + season + '/' + simpleLeagueName + '.' + divisionNames[j] + '.json';    
                            fileHelper.writeFile(fileName, JSON.stringify(currentSeason));
                        }
                        else {
                            console.log('API error on ' + simpleLeagueName + ', ' + season + ', ' + divisionNames[j] + ': ' + error2);
                        }
                    });
                }
                else {
                    console.log('Removed ' + divisionNames[j]);
                }
            }
        });
    });                   
}

downloadSeason(REBBL.leagueNames.REL, 'REL', seasonName);
downloadSeason(REBBL.leagueNames.GMAN, 'GMAN', seasonName);
