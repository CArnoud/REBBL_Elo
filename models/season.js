const fileHelper = require('../utils/fileHelper.js');
const Game = require('../models/game').Game;

const filePrefix = './files/';

class Season {
    constructor(seasonName) {
        console.log(seasonName);
        this.seasonName = seasonName;
        const fileNames = fileHelper.readDir(this.getDirPath());
        this.numberOfGames = 0;
        this.numberOfDraws = 0;
        this.games = [];
        for (let i = 0; i < fileNames.length; i++) {
            const gamesList = JSON.parse(fileHelper.readFile(this.getFilePath(fileNames[i])));
            const division = [];

            for (let j = 0; j < gamesList.length; j++) {
                const round = [];
                for (let k = 0; k < gamesList[j].length; k++) {
                    round.push(new Game(gamesList[j][k]));
                }
                division.push(round);
            }

            this.games.push(division);
        }
        this.loadStats();
    }

    loadStats() {
        for (let i in this.games) {
            for (let j in this.games[i]) {
                for (let k in this.games[i][j]) {
                    this.numberOfGames++;
                    if (this.games[i][j][k].getWinnerId() === null) {
                        this.numberOfDraws++;
                    }
                }
            }
        }
    }

    getDirPath() {
        return filePrefix + this.seasonName;
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
