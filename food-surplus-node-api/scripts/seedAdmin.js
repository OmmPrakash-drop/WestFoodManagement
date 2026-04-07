const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const existingAdmin = await User.findOne({ where: { username: 'admin' } });
        if (existingAdmin) {
            console.log('Admin already exists.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN' // Explicitly set as ADMIN
        });

        console.log('Admin user created successfully! Username: admin | Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seedAdmin();
