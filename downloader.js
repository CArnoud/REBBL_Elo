const request = require('request');
const fileHelper = require('./utils/fileHelper.js')
const fs = require('fs');
const seasonNames = require('./utils/rebbl').seasonNames;
const REBBL = require('./utils/rebbl');
const Game = require('./models/game').Game;

const updateAll = false;

function parseSeason(season) {
    const seasonResult = [];
    const roundSet = new Set([]);

    for (let i=0; i < season.length; i++) {
        const game = Game.parse(season[i]);
        if (!roundSet.has(game.round)) {
            roundSet.add(game.round);
            seasonResult.push([]);
        }
    }
   
    for (let i=0; i < season.length; i++) {
        try {
            const game = Game.parse(season[i]);
            seasonResult[game.round-1].push(game);
        }
        catch (e) {
            console.log('Unable to process round ' + result.round + 
                        ' season.length ' + season.length + 
                        ' rounds ' + roundSet.length + 
                        ': ' + season[i]);
        }
    }

    return seasonResult;
}

for (let i = 0; i < seasonNames.length; i++) {
    request.get(REBBL.api.host + '/division/' + REBBL.leagueNames.REL + '/' + seasonNames[i], (error, response) => {
        const divisionNames = JSON.parse(response.body);
        console.log('season: ' + seasonNames[i] + ', divisions: ' + divisionNames.length);

        fs.mkdir('files/' + seasonNames[i], { recursive: true }, (err) => {
            if (!err || updateAll) {
                for (let j = 0; j < divisionNames.length; j++) {
                    request.get(REBBL.api.host + '/division/' + REBBL.leagueNames.REL + '/' + seasonNames[i] + '/' + divisionNames[j], (error2, response2) => {
                        const games = JSON.parse(response2.body);
                        const season = parseSeason(games);            
            
                        const fileName = 'files/' + seasonNames[i] + '/' + REBBL.leagueNames.REL + '.' + divisionNames[j] + '.json';    
                        fileHelper.writeFile(fileName, JSON.stringify(season));
                    });
                }
            }
            else {
                console.log('season: ' + seasonNames[i] + err);
            }                
        });
    });
};
