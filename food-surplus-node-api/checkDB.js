const { User } = require('./models');

async function check() {
    const users = await User.findAll();
    console.log("Users in DB:", users.map(u => ({ id: u.userId, username: u.username, role: u.role })));
    process.exit(0);
}
check();
