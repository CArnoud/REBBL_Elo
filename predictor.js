const fileHelper = require('./utils/fileHelper');
const seasonNames = require('./utils/rebbl').seasonNames;

const season = 'season 2';

const elo = JSON.parse(fileHelper.readFile('files/elo/elo.json'));

console.log(elo);

console.log(seasonNames);
