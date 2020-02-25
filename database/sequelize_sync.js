const REBBL = require('../utils/rebbl');
const Sequelize = require('./sequelize_wrapper');
const sequelize = Sequelize.get_connection();
const models = Sequelize.get_models(sequelize);

sequelize.sync()
    .then(() => {
        models.League.bulkCreate([
            {
                name: REBBL.leagueNames.REL,
                simple_name: 'REL'
            },
            {
                name: REBBL.leagueNames.GMAN,
                simple_name: 'GMAN'
            },
            {
                name: REBBL.leagueNames.BIGO,
                simple_name: 'BIGO'
            },
            // {
            //     name: REBBL.leagueNames.PLAYOFFS,
            //     simple_name: 'PLAYOFFS'
            // }
        ], {
            fields: ["id", "name", "simple_name"],
            updateOnDuplicate: ["name"]
        }).then(() => {
            console.log('Sync completed successfully');
            sequelize.close();
        })        
    }).catch((e) => {
        console.log('Sync error' + e);
        sequelize.close();
    });
