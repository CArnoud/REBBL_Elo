const fileHelper = require('../utils/fileHelper.js');
const Game = require('../models/game').Game;
const Database = require('../database/database').Database;

class Season {
    constructor(seasonFromDb, competitionsFromDb, gamesFromDb) {
        this.database = new Database();
        this.database.connect();
        this.seasonName = seasonFromDb.name;
        this.id = seasonFromDb.id;
        this.competitions = competitionsFromDb;
        this.games = [];

        console.log('seasonId ' + this.id);

        console.log('games length ' + gamesFromDb.length);

        // console.log('Competitions');
        // console.log(JSON.stringify(competitionsFromDb));

        for (let i=0; i < gamesFromDb.length; i++) {
            // games in a season
            for (let j=0; j < gamesFromDb[i]; j++) {
                // games in a competition
                if (Game.isGameValid2(gamesFromDb[i][j])) {
                    this.games.push(new Game(gamesFromDb[i][j]));
                }
            }
        }

        console.log('games');
        console.log(JSON.stringify(this.games));


        console.log('sample game');
        console.log(JSON.stringify(gamesFromDb[0][0]));
        
        // for (let i = 0; i < this.competitions.length; i++) {
        //     for (let j = 0; j < this.competitions[i].games.length; j++) {
        //         if (Game.isValid2(this.competitions[i].games[j])) {
        //             this.games.push(new Game(this.competitions[i].games[j]));
        //         }
        //     }
        // }

        console.log(this.seasonName);
    }

    async saveGameToDatabase(connection, game) {
        await connection.insertTeam(game.getTeams()[0]);
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

    getGame(division, round, game) {
        return this.games[division][round][game];
    }

    getGames() {
        return this.games;
    }

    getTeamIds() {
        const result = [];

        for (let i in this.games) {
            for (let j in this.games[i]) {
                for (let k in this.games[i][j]) {
                    const game = this.games[i][j][k];
                    if (!result.includes(game.getTeam(0).id)) {
                        result.push(game.getTeam(0).id);
                    }
                    if (!result.includes(game.getTeam(1).id)) {
                        result.push(game.getTeam(1).id);
                    }
                }
            }
        }

        return result;
    }

    getNumberOfGames() {
        return this.numberOfGames;
    }

    getNumberOfDraws() {
        return this.numberOfDraws;
    }
}

exports.Season = Season;
