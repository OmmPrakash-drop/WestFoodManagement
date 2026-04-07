const { sequelize } = require('../models');

async function resetDB() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB. Starting full reset...');
        
        // This drops all tables and recreates them cleanly!
        await sequelize.sync({ force: true });
        
        console.log('Database fully cleaned and recreated!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to reset DB:', err);
        process.exit(1);
    }
}

resetDB();
