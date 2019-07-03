const request = require('request');
const fileHelper = require('./utils/fileHelper.js')
const fs = require('fs');
const seasonNames = require('./utils/rebbl').seasonNames;
const REBBL = require('./utils/rebbl');

const updateAll = false;

function parseGame(game) {
    const result = {
        round: game.round,
        match_id: game.match_id,
        team_ids: [
            game.opponents[0].team.id,
            game.opponents[1].team.id
        ]
    };
    result.winner_id = game.winner ? game.winner.team.id : null;
    return result;
}

function parseSeason(season) {
    const seasonResult = [];
    const roundSet = new Set([]);

    for (let i=0; i < season.length; i++) {
        if (!roundSet.has(parseGame(season[i]).round)) {
            roundSet.add(parseGame(season[i]).round);
            seasonResult.push([]);
        }
    }

   
    for (let i=0; i < season.length; i++) {
        try {
            const game = season[i];
            const result = parseGame(game);

            seasonResult[result.round-1].push(result);
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
