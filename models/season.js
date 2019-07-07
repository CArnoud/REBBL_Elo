const fileHelper = require('../utils/fileHelper.js');

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
            this.games.push(JSON.parse(fileHelper.readFile(this.getFilePath(fileNames[i]))));
        }
        this.loadStats();
    }

    loadStats() {
        for (let i in this.games) {
            for (let j in this.games[i]) {
                for (let k in this.games[i][j]) {
                    this.numberOfGames++;
                    if (this.games[i][j][k].winner_id === null) {
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
                    if (!result.includes(game.team_ids[0])) {
                        result.push(game.team_ids[0]);
                    }
                    if (!result.includes(game.team_ids[1])) {
                        result.push(game.team_ids[1]);
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
