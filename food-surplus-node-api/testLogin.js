const { User } = require('./models');

async function test() {
    const user = await User.findOne({ where: { username: 'admin' } });
    if(user) {
        console.log("Admin user found");
        console.log("Username:", user.username);
        console.log("Role:", user.role);
        console.log("Password hash:", user.password);
    } else {
        console.log("Admin user NOT found in database!");
    }
}
test();
