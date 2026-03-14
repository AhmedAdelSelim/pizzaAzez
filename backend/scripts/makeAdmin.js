require('dotenv').config();
const { getDb } = require('../src/config/db');

async function makeAdmin(phone) {
    if (!phone) {
        console.error('Please provide a phone number: node makeAdmin.js <phone>');
        process.exit(1);
    }

    try {
        const db = getDb();
        const { data: user, error: findError } = await db.from('users').select('*').eq('phone', phone).single();
        if (findError || !user) {
            console.error('User not found with phone:', phone);
            process.exit(1);
        }

        const { error: updateError } = await db.from('users').update({ role: 'admin' }).eq('id', user.id);
        if (updateError) {
            console.error('Failed to update user role:', updateError.message);
            process.exit(1);
        }

        console.log(`Successfully made user ${user.name} (${user.phone}) an admin!`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

makeAdmin(process.argv[2]);
