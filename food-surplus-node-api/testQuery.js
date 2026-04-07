const { Restaurant, User } = require('./models');
async function test() {
    try {
        const r = await Restaurant.findAll({
            where: { verificationStatus: 'PENDING' },
            include: [{ model: User, attributes: ['username', 'email'] }]
        });
        console.log(r);
    } catch(e) {
        console.error(e);
    }
}
test();
