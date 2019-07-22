const legacyRaces = require('../utils/legacyRaces.json');


function getNormalizedRace(raceNumber) {
    return legacyRaces[raceNumber];
}

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
                name: rebblObj.opponents[0].team.name,
                coach_id: rebblObj.opponents[0].coach.id,
                tv: rebblObj.opponents[0].team.value,
                race: rebblObj.legacy ? getNormalizedRace(rebblObj.opponents[0].team.race) : rebblObj.opponents[0].team.race
            }, {
                id: rebblObj.opponents[1].team.id,
                name: rebblObj.opponents[1].team.name,
                coach_id: rebblObj.opponents[1].coach.id,
                tv: rebblObj.opponents[1].team.value,
                race: rebblObj.legacy ? getNormalizedRace(rebblObj.opponents[1].team.race) : rebblObj.opponents[1].team.race
            }]
        };
        result.winner_id = rebblObj.winner ? rebblObj.winner.team.id : null;
        return result;
    }
}

exports.Game = Game;
