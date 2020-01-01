const Sequelize = require('sequelize');
const sequelize = new Sequelize('rebbl', 'root', 'password', {
    host: 'localhost',
    dialect:'mysql'
});

const League = sequelize.define('League', {
  name: Sequelize.STRING,
});

const Season = sequelize.define('season', {
    name: Sequelize.STRING,
});
Season.belongsTo(League);

const Competition = sequelize.define('competition', {
    name: Sequelize.STRING,
});
Competition.belongsTo(Season);

const Race = sequelize.define('race', {
    name: Sequelize.STRING,
});

const Team = sequelize.define('team', {
    name: Sequelize.STRING,
    coach_id: Sequelize.STRING
});
Team.belongsTo(Race);

const Match = sequelize.define('match', {
    rebbl_id: Sequelize.STRING,
    name: Sequelize.STRING,
    match_id: Sequelize.STRING
});
Match.belongsTo(Competition);
Match.hasMany(Team);

sequelize.sync(/*{force: true}*/).then(function() {
  console.log('Done');
  sequelize.close();
}).catch((e) => {
    console.log('merdaaaaaa' + e);
    sequelize.close();
});
