const Sequelize = require('sequelize');
const sequelize = new Sequelize('rebbl', 'root', 'password', {
    host: 'localhost',
    dialect:'mysql'
});

const League = sequelize.define('league', {
    name: Sequelize.STRING,
});

const Season = sequelize.define('season', {
    name: Sequelize.STRING,
});

const Competition = sequelize.define('competition', {
    name: Sequelize.STRING,
});

const Race = sequelize.define('race', {
    name: Sequelize.STRING,
});

const Team = sequelize.define('team', {
    rebbl_id: Sequelize.STRING,
    name: Sequelize.STRING,
    coach_id: Sequelize.STRING
});

const Match = sequelize.define('match', {
    rebbl_id: Sequelize.STRING,
    name: Sequelize.STRING,
    match_id: Sequelize.STRING
});

const setAssociations = async () => {
    Season.belongsTo(League);

    Competition.belongsTo(Season);

    Team.belongsTo(Race);

    Match.belongsTo(Competition);
    Match.hasMany(Team);
    return sequelize;
    // sequelize.sync(/*{force: true}*/).then(function() {
    //     console.log('Done');
    //     return sequelize;
    // }).catch((e) => {
    //     console.log('merdaaaaaa' + e);
    // });
}
module.exports = setAssociations;
