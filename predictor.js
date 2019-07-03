const fileHelper = require('./utils/fileHelper');
const seasonNames = require('./utils/rebbl').seasonNames;

const season = seasonNames[1];

const elo = JSON.parse(fileHelper.readFile('files/elo/elo.json'));

console.log(season);
