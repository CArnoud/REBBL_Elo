const request = require('request');
const fs = require('fs');

const rebblNetHost = 'https://rebbl.net/api/v2';
const leagueNames = {
    REL: 'REBBL%20-%20REL'
};

const seasonNames = {
    REL: [
        'season 1',
        'season 2',
        'season 3',
        'season 4',
        'season 5',
        'season 6',
        'season 7',
        'season 8',
        'season 9',
        'season 10',
        'season 11'
    ]
};

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

for (let i = 0; i < seasonNames.REL.length; i++) {
    request.get(rebblNetHost + '/division/' + leagueNames.REL + '/' + seasonNames.REL[i], (error, response) => {
        const divisionNames = JSON.parse(response.body);
        console.log('season: ' + seasonNames.REL[i] + ', divisions: ' + divisionNames.length);

        fs.mkdir('files/' + seasonNames.REL[i], { recursive: true }, (err) => {
            if (!err || updateAll) {
                for (let j = 0; j < divisionNames.length; j++) {
                    request.get(rebblNetHost + '/division/' + leagueNames.REL + '/' + seasonNames.REL[i] + '/' + divisionNames[j], (error2, response2) => {
                        const games = JSON.parse(response2.body);
                        const season = parseSeason(games);            
            
                        const fileName = 'files/' + seasonNames.REL[i] + '/' + leagueNames.REL + '.' + divisionNames[j] + '.json';    
                        fs.writeFile(fileName, JSON.stringify(season), function(e) {
                            if (e) {
                                console.log(e);
                            }
                        });
                    });
                }
            }
            else {
                console.log('season: ' + seasonNames.REL[i] + err);
            }                
        });
    });
};
