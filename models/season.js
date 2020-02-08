const Game = require('../models/game').Game;

class Season {
    constructor(seasonFromDb, gamesFromDb) {
        this.seasonName = seasonFromDb.name;
        this.id = seasonFromDb.id;
        this.games = [];

        for (let i=0; i < gamesFromDb.length; i++) {
            // games in a season
            for (let j=0; j < gamesFromDb[i].length; j++) {
                // games in a competition
                const game = new Game(gamesFromDb[i][j]);
                this.games.push(game);
            }
        }

        this.games.sort(this.sortGamesByRound);
    }

    sortGamesByRound(a, b) {
        return a.round - b.round;
    }

    static sortSeasons(a, b) {
        const aNumber = parseInt(a.seasonName.split('season ')[1]);
        const bNumber = parseInt(b.seasonName.split('season ')[1]);
        return aNumber - bNumber;
    }

    getWinnerRace(game) {
        if (!game.getWinnerId()) {
            return null;
        }
        else {
            return game.getTeam(0).id === game.getWinnerId() ? game.getTeam(0).race : game.getTeam(1).race;
        }
    }

    updateSpecificRaceRecord(race, winnerRace) {
        let currentObj = this.raceRecords[race] ? this.raceRecords[race] : { wins: 0, draws: 0, losses: 0 };

        if (race === winnerRace) {
            currentObj.wins++;
        }
        else if (!winnerRace) {
            currentObj.draws++;
        }
        else {
            currentObj.losses++;
        }
        this.raceRecords[race] = currentObj;
    }

    updateRaceRecords(game) {
        const races = [game.getTeam(0).race, game.getTeam(1).race];
        const winnerRace = this.getWinnerRace(game);
        this.updateSpecificRaceRecord(races[0], winnerRace);
        this.updateSpecificRaceRecord(races[1], winnerRace);
    }

    addRaceRecords(raceRecords) {
        const recordIndices = Object.keys(raceRecords);

        for (let i in recordIndices) {
            const index = recordIndices[i];

            if (!this.raceRecords[index]) {
                this.raceRecords[index] = {
                    wins: 0,
                    draws: 0,
                    losses: 0
                };
            }

            this.raceRecords[index].wins = this.raceRecords[index].wins + raceRecords[index].wins;
            this.raceRecords[index].draws = this.raceRecords[index].draws + raceRecords[index].draws;
            this.raceRecords[index].losses = this.raceRecords[index].losses + raceRecords[index].losses;
        }
    }

    updateRaceMatchups(game) {
        const races = [game.getTeam(0).race, game.getTeam(1).race];
        const indexString = races[1] > races[0] ? races[0] + races[1] : races[1] + races[0];
        const winnerRace = this.getWinnerRace(game);
        let statObj = this.raceMatchups[indexString];

        if (!statObj) {
            statObj = {
                draw: 0
            }
            statObj[races[0]] = 0;
            statObj[races[1]] = 0;
        }

        if (winnerRace) {
            statObj[winnerRace]++;
        }
        else {
            statObj.draw++;
        }

        this.raceMatchups[indexString] = statObj;
    }

    addRaceMatchups(matchups) {
        const matchupIndeces = Object.keys(matchups);

        for (let i in matchupIndeces) {
            const index = matchupIndeces[i];
            const keys = Object.keys(matchups[index]);
            
            for (let j in keys) {
                if (!this.raceMatchups[index]) {
                    this.raceMatchups[index] = {};
                }
                
                const currentValue = this.raceMatchups[index][keys[j]] ? this.raceMatchups[index][keys[j]] : 0;
                this.raceMatchups[index][keys[j]] = currentValue + matchups[index][keys[j]];
            }
        }
    }

    loadStats() {
        for (let i in this.games) {
            for (let j in this.games[i]) {
                for (let k in this.games[i][j]) {
                    const game = this.games[i][j][k];

                    this.updateRaceMatchups(game);
                    this.updateRaceRecords(game);
                    this.numberOfGames++;
                    if (game.getWinnerId() === null) {
                        this.numberOfDraws++;
                    }
                }
            }
        }
    }

    getRaceMatchups() {
        return this.raceMatchups;
    }

    getRaceRecords() {
        return this.raceRecords;
    }

    getDirPath() {
        return this.filePrefix + this.seasonName;
    }

    getFilePath(fileName) {
        return this.getDirPath() + '/' + fileName;
    }

    getGames() {
        return this.games;
    }

    getNumberOfGames() {
        return this.games.length;
    }

    getNumberOfDraws() {
        return this.numberOfDraws;
    }
}

exports.Season = Season;
