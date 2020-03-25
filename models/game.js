const legacyRaces = require('../utils/legacyRaces.json');


function getNormalizedRace(raceNumber) {
    let result = legacyRaces[raceNumber];
    if (!result) {
        console.log('Race not found ' + raceNumber);
        result = raceNumber;
    }
    return result;
}

/*
Game {
  round: 1,
  match_id: '2003326',
  winner_id: '577429',
  competitionId: 33,
  teams: [ { id: '577429', tv: 1690 }, { id: '577429', tv: 1690 } ] }
*/
class Game {
    constructor(matchObj) {
        this.round = matchObj.round;
        this.match_id = matchObj.match_id;
        this.winner_id = matchObj.winner_id;
        this.competitionId = matchObj.competitionId;

        // TODO: coach_id
        this.teams = [{
            id: matchObj.home_team_id,
            tv: matchObj.home_team_tv
        }, {
            id: matchObj.away_team_id,
            tv: matchObj.away_team_tv
        }];
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

    gameHasBeenPlayed() {
        return this.match_id && this.match_id.length > 0;
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
        if (matchObj.opponents) {
            const teamName1 = matchObj.opponents[0].team.name.toLowerCase();
            const teamName2 = matchObj.opponents[1].team.name.toLowerCase();
            return !teamName1.includes('admin') &&
                !teamName2.includes('admin') &&
                !teamName1.includes('bye week') && 
                !teamName2.includes('bye week');
        }
        else {
            return false;
        }
    }
}

exports.Game = Game;
