const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function debugLogin() {
    const user = await User.findOne({ where: { username: 'admin' } });
    if (!user) {
        console.log("User not found via findOne.");
        return;
    }
    console.log("Found user:", user.username);
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log("isMatch:", isMatch);
    process.exit(0);
}
debugLogin();
