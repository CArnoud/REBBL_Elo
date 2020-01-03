const legacyRaces = require('../utils/legacyRaces.json');


function getNormalizedRace(raceNumber) {
    let result = legacyRaces[raceNumber];
    if (!result) {
        console.log('Race not found ' + raceNumber);
        result = raceNumber;
    }
    return result;
}

class Game {
    constructor(matchObj) {
        this.round = matchObj.round;
        this.match_id = matchObj.match_id;
        this.winner_id = matchObj.winner_id;

        // TODO: coach_id, race and name?
        this.teams = [{
            id: matchObj.home_team_id,
            tv: matchObj.home_team_tv
        }, {
            id: matchObj.home_team_id,
            tv: matchObj.home_team_tv
        }];

        // old
        // this.league = matchObj.league;
        // this.competition = matchObj.competition;
        // this.round = matchObj.round;
        // this.match_id = matchObj.match_id;
        // this.teams = matchObj.teams;
        // this.winner_id = matchObj.winner_id;
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
        try {
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
        catch(e) {
            console.log('Problematic game: ' + JSON.stringify(rebblObj));
        }
    }

    static isGameValid(matchObj) {
        return matchObj.match_id &&
            !matchObj.teams[0].name.toLowerCase().includes('admin') &&
            !matchObj.teams[1].name.toLowerCase().includes('admin');
    }

    static isGameValid2(matchObj) {
        return matchObj.match_id !== undefined; // need admin check
    }
}

exports.Game = Game;
