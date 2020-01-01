const Sequelize = require('./sequelize_wrapper');
const sequelize = Sequelize.get_connection();

sequelize.sync().then(function () {
    console.log('Sync completed successfully');
    sequelize.close();
}).catch((e) => {
    console.log('Sync error' + e);
    sequelize.close();
});;
