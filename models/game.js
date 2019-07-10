/*
{"_id":"5cc2fe22fb6d0640102849bf","contest_id":533664,"competition":"Season 1 - Division 1","competition_id":10678,"format":"round_robin","league":"REBBL - REL","legacy":true,"match_id":533664,"match_uuid":"10000824a0","opponents":[{"coach":{"id":7245,"name":"DrBob","twitch":null,"youtube":null,"country":"gb","lang":"english"},"team":{"id":247727,"name":"Kill My Friends","logo":"Chaos_05","value":1000,"motto":"RIP: Kratrz, W3RM, Kiva","score":1,"death":0,"race":8}},{"coach":{"id":1681,"name":"Gamba","twitch":null,"youtube":null,"country":"gb","lang":"english"},"team":{"id":303649,"name":"The Florida Lizardmen","logo":"Lizardman_09","value":980,"motto":"","score":1,"death":0,"race":5}}],"round":1,"season":"season 1","stadium":"DarkElf","status":"played","type":"single_match","winner":null}
*/

// exports.parse = (gameObj) => {
//     const result = {
//         round: gameObj.round,
//         match_id: gameObj.match_id,
//         team_ids: [
//             gameObj.opponents[0].team.id,
//             gameObj.opponents[1].team.id
//         ]
//     };
//     result.winner_id = gameObj.winner ? gameObj.winner.team.id : null;
//     return result;
// };

exports.toString = (gameObj, elo1, elo2) => {
    const result = gameObj.team_ids[0] + '(' + elo1 + ') vs ' +
        gameObj.team_ids[1] + '(' + elo2 + ')\n' +
        'winner: ' + gameObj.winner_id;
    return result;
};

class Game {
    constructor(matchObj) {
        this.league = matchObj.league;
        this.competition = matchObj.competition;
        this.round = matchObj.round;
        this.match_id = matchObj.match_id;
        this.teams = matchObj.teams;
        this.winner_id = matchObj.winner_id;
    }

    getTeams() {
        return this.teams;
    }

    getTeam(index) {
        return this.teams[index];
    }

    getWinnerId() {
        return this.winner_id;
    }

    static parse(rebblObj) {
        const result = {
            league: rebblObj.league,
            competition: rebblObj.competition,
            round: rebblObj.round,
            match_id: rebblObj.match_id,
            teams: [{
                id: rebblObj.opponents[0].team.id,
                coach_id: rebblObj.opponents[0].coach.id,
                tv: rebblObj.opponents[0].team.value,
                race: rebblObj.opponents[0].team.race
            }, {
                id: rebblObj.opponents[1].team.id,
                coach_id: rebblObj.opponents[1].coach.id,
                tv: rebblObj.opponents[1].team.value,
                race: rebblObj.opponents[1].team.race
            }]
        };
        result.winner_id = rebblObj.winner ? rebblObj.winner.team.id : null;
        return result;
    }
}

exports.Game = Game;
