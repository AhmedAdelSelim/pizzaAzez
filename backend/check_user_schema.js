const { userRepository } = require('./src/repositories');
const connectDB = require('./src/config/db');

async function checkUserSchema() {
    try {
        connectDB();
        const user = await userRepository.findOne({});
        if (user) {
            console.log('User keys:', Object.keys(user));
            if ('push_token' in user) {
                console.log('SUCCESS: push_token column exists!');
            } else {
                console.log('WARNING: push_token column NOT found. Please run the SQL in implementation_plan.md');
            }
        } else {
            console.log('No users found to check.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUserSchema();
