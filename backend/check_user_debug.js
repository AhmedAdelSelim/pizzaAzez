const connectDB = require('./src/config/db');
connectDB();
const { getDb } = require('./src/config/db');

async function checkUser() {
    try {
        const { data, error } = await getDb()
            .from('users')
            .select('*')
            .eq('phone', '01063411691')
            .single();
        
        if (error) {
            console.error('Error fetching user:', error.message);
        } else {
            console.log('USER_DATA_START');
            console.log(JSON.stringify(data, null, 2));
            console.log('USER_DATA_END');
        }
    } catch (err) {
        console.error('Script error:', err.message);
    }
}

checkUser();
