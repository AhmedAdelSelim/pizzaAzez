const { userRepository } = require('./src/repositories');
const connectDB = require('./src/config/db');

async function listUsers() {
    try {
        connectDB();
        const users = await userRepository.find({});
        console.log('Total users:', users.length);
        users.forEach(u => {
            console.log(`ID: ${u.id}, Phone: '${u.phone}', Role: ${u.role}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();
