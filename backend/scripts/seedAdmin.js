require('dotenv').config();
const connectDB = require('../src/config/db');
const getDb = connectDB.getDb;
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    await connectDB();
    const db = getDb();
    const phone = '01021317616';
    const password = 'admin'; // Basic password for demo purposes

    try {
        // Check if user already exists
        const { data: existingUser } = await db.from('users').select('*').eq('phone', phone).single();
        
        if (existingUser) {
            console.log('User already exists. Ensuring admin role...');
            await db.from('users').update({ role: 'admin' }).eq('id', existingUser.id);
            console.log('Role updated to admin.');
            return;
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: 'admin_' + Date.now(),
            name: 'Admin',
            phone: phone,
            password: hashedPassword,
            role: 'admin',
            address: 'Admin Address'
        };

        const { error } = await db.from('users').insert(newUser);
        
        if (error) {
            console.error('Failed to create admin:', error.message);
        } else {
            console.log('Successfully created admin user!');
            console.log('Phone: 01021317616');
            console.log('Password: admin');
        }
    } catch (err) {
        console.error('Error seeding admin:', err.message);
    } finally {
        process.exit();
    }
}

seedAdmin();
